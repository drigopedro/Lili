import { corsHeaders } from '../_shared/cors.ts';

const FATSECRET_CLIENT_ID = Deno.env.get('FATSECRET_CLIENT_ID');
const FATSECRET_CLIENT_SECRET = Deno.env.get('FATSECRET_CLIENT_SECRET');

interface BarcodeLookupRequest {
  barcode: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!FATSECRET_CLIENT_ID || !FATSECRET_CLIENT_SECRET) {
      throw new Error('FatSecret API credentials not configured');
    }

    const { barcode }: BarcodeLookupRequest = await req.json();

    if (!barcode) {
      throw new Error('Barcode is required');
    }

    // Get OAuth token from FatSecret
    const tokenResponse = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials&scope=basic'
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get FatSecret access token');
    }

    const tokenData = await tokenResponse.json();

    // Look up product by barcode using FatSecret API
    const searchParams = new URLSearchParams({
      method: 'food.find_id_for_barcode',
      barcode,
      format: 'json'
    });

    const barcodeResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!barcodeResponse.ok) {
      throw new Error('Failed to lookup barcode');
    }

    const barcodeData = await barcodeResponse.json();

    // If we found a food ID, get the full nutrition info
    if (barcodeData.food_id) {
      const nutritionParams = new URLSearchParams({
        method: 'food.get',
        food_id: barcodeData.food_id.value,
        format: 'json'
      });

      const nutritionResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${nutritionParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (nutritionResponse.ok) {
        const nutritionData = await nutritionResponse.json();
        return new Response(JSON.stringify({
          ...barcodeData,
          nutrition: nutritionData
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify(barcodeData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});