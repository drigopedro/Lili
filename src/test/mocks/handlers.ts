import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          firstName: 'Test',
          lastName: 'User',
        },
      },
    });
  }),

  http.post('/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          firstName: 'Test',
          lastName: 'User',
        },
      },
    });
  }),

  // Supabase REST API endpoints
  http.get('/rest/v1/user_profiles', () => {
    return HttpResponse.json([
      {
        id: 'mock-user-id',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        onboarding_completed: true,
      },
    ]);
  }),

  http.get('/rest/v1/recipes', () => {
    return HttpResponse.json([
      {
        id: 'recipe-1',
        name: 'Test Recipe',
        description: 'A test recipe',
        prep_time_minutes: 15,
        cook_time_minutes: 30,
        servings: 4,
        difficulty: 'easy',
        calories_per_serving: 350,
        protein_g: 25,
        carbs_g: 40,
        fat_g: 12,
      },
    ]);
  }),

  http.get('/rest/v1/meal_plans', () => {
    return HttpResponse.json([
      {
        id: 'meal-plan-1',
        user_id: 'mock-user-id',
        name: 'Test Meal Plan',
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        is_active: true,
      },
    ]);
  }),

  // Error simulation endpoints
  http.get('/rest/v1/error-test', () => {
    return HttpResponse.json(
      { message: 'Test error' },
      { status: 500 }
    );
  }),

  http.get('/rest/v1/network-error-test', () => {
    return HttpResponse.error();
  }),
];