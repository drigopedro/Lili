import { corsHeaders } from '../_shared/cors.ts';

const FATSECRET_CLIENT_ID = Deno.env.get('FATSECRET_CLIENT_ID');
const FATSECRET_CLIENT_SECRET = Deno.env.get('FATSECRET_CLIENT_SECRET');

interface NutritionInfoRequest {
  food_id: string;
  serving_id?: string;
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

    const { food_id, serving_id }: NutritionInfoRequest = await req.json();

    if (!food_id) {
      throw new Error('Food ID is required');
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

    // Get nutrition info using FatSecret API
    const searchParams = new URLSearchParams({
      method: 'food.get',
      food_id,
      format: 'json'
    });

    if (serving_id) {
      searchParams.append('serving_id', serving_id);
    }

    const nutritionResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!nutritionResponse.ok) {
      throw new Error('Failed to get nutrition information');
    }

    const nutritionData = await nutritionResponse.json();
    
    return new Response(JSON.stringify(nutritionData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Nutrition info error:', error);
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