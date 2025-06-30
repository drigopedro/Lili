import { corsHeaders } from '../_shared/cors.ts';

const FATSECRET_CLIENT_ID = Deno.env.get('FATSECRET_CLIENT_ID');
const FATSECRET_CLIENT_SECRET = Deno.env.get('FATSECRET_CLIENT_SECRET');

interface FoodSearchRequest {
  search_expression: string;
  page_number?: number;
  max_results?: number;
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

    const { search_expression, page_number = 0, max_results = 20 }: FoodSearchRequest = await req.json();

    if (!search_expression) {
      throw new Error('Search expression is required');
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

    // Search for foods using FatSecret API
    const searchParams = new URLSearchParams({
      method: 'foods.search',
      search_expression,
      page_number: page_number.toString(),
      max_results: max_results.toString(),
      format: 'json'
    });

    const searchResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search foods');
    }

    const searchData = await searchResponse.json();
    
    return new Response(JSON.stringify(searchData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Food search error:', error);
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