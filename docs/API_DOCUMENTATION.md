# 🔌 Lili Nutrition App - API Documentation

## Overview

The Lili Nutrition App API provides comprehensive endpoints for managing recipes, meal plans, user profiles, and nutrition data. This RESTful API is built with security, performance, and scalability in mind.

**Base URL**: `https://api.lili-nutrition.app/v1`
**Authentication**: Bearer Token (JWT)
**Rate Limiting**: 1000 requests per hour per user

## Authentication

### POST /auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### POST /auth/register
Create new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User Management

### GET /users/profile
Get current user's profile information.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "height_cm": 175,
  "weight_kg": 70.5,
  "activity_level": "moderately-active",
  "health_goals": ["weight_loss", "muscle_gain"],
  "dietary_restrictions": ["vegetarian"],
  "medical_conditions": [],
  "onboarding_completed": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### PUT /users/profile
Update user profile information.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "height_cm": 175,
  "weight_kg": 70.5,
  "activity_level": "very-active",
  "health_goals": ["muscle_gain"],
  "dietary_restrictions": ["vegetarian", "gluten-free"]
}
```

## Recipe Management

### GET /recipes
Search and filter recipes.

**Query Parameters:**
- `q` (string): Search query
- `cuisine_type` (string): Filter by cuisine
- `difficulty` (string): easy, medium, hard
- `max_prep_time` (integer): Maximum prep time in minutes
- `max_cook_time` (integer): Maximum cook time in minutes
- `dietary_restrictions` (array): Filter by dietary restrictions
- `min_rating` (number): Minimum rating (1-5)
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 20, max: 100)
- `sort_by` (string): relevance, rating, time, difficulty

**Example Request:**
```
GET /recipes?q=chicken&cuisine_type=italian&difficulty=easy&page=1&limit=20
```

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "name": "Italian Chicken Parmesan",
      "description": "Classic Italian chicken dish with crispy coating",
      "image_url": "https://images.pexels.com/photos/123456/recipe.jpg",
      "prep_time_minutes": 15,
      "cook_time_minutes": 30,
      "servings": 4,
      "difficulty": "easy",
      "cuisine_type": "italian",
      "tags": ["chicken", "italian", "comfort-food"],
      "nutrition": {
        "calories": 450,
        "protein": 35.2,
        "carbs": 25.1,
        "fat": 22.8,
        "fiber": 3.2,
        "sugar": 5.1,
        "sodium": 680
      },
      "rating": {
        "average": 4.5,
        "count": 127
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

### GET /recipes/{id}
Get detailed recipe information.

**Response:**
```json
{
  "id": "uuid",
  "name": "Italian Chicken Parmesan",
  "description": "Classic Italian chicken dish with crispy coating",
  "image_url": "https://images.pexels.com/photos/123456/recipe.jpg",
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "servings": 4,
  "difficulty": "easy",
  "cuisine_type": "italian",
  "instructions": [
    "Preheat oven to 200°C",
    "Season chicken breasts with salt and pepper",
    "Coat in breadcrumbs and parmesan",
    "Bake for 25-30 minutes until golden"
  ],
  "ingredients": [
    {
      "id": "uuid",
      "name": "Chicken breast",
      "amount": 500,
      "unit": "g",
      "category": "meat"
    },
    {
      "id": "uuid",
      "name": "Breadcrumbs",
      "amount": 100,
      "unit": "g",
      "category": "pantry"
    }
  ],
  "nutrition": {
    "calories": 450,
    "protein": 35.2,
    "carbs": 25.1,
    "fat": 22.8,
    "fiber": 3.2,
    "sugar": 5.1,
    "sodium": 680
  },
  "tags": ["chicken", "italian", "comfort-food"],
  "rating": {
    "average": 4.5,
    "count": 127
  },
  "reviews": [
    {
      "id": "uuid",
      "user_name": "Sarah M.",
      "rating": 5,
      "comment": "Absolutely delicious! Family loved it.",
      "helpful_count": 12,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /recipes/{id}/rating
Rate a recipe.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Absolutely delicious! Family loved it."
}
```

### GET /recipes/saved
Get user's saved recipes.

**Response:**
```json
{
  "saved_recipes": [
    {
      "id": "uuid",
      "recipe_id": "uuid",
      "recipe_name": "Italian Chicken Parmesan",
      "recipe_data": { /* full recipe object */ },
      "saved_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /recipes/{id}/save
Save a recipe to favorites.

### DELETE /recipes/{id}/save
Remove recipe from favorites.

## Meal Planning

### GET /meal-plans
Get user's meal plans.

**Query Parameters:**
- `active` (boolean): Filter active meal plans
- `start_date` (date): Filter by start date
- `end_date` (date): Filter by end date

**Response:**
```json
{
  "meal_plans": [
    {
      "id": "uuid",
      "name": "Week of January 1st",
      "description": "Healthy meal plan for the new year",
      "start_date": "2024-01-01",
      "end_date": "2024-01-07",
      "is_active": true,
      "daily_plans": [
        {
          "date": "2024-01-01",
          "meals": [
            {
              "id": "uuid",
              "recipe_id": "uuid",
              "meal_type": "breakfast",
              "scheduled_time": "08:00",
              "servings": 1,
              "completed": false,
              "recipe": { /* recipe object */ }
            }
          ],
          "nutrition_summary": {
            "calories": 1850,
            "protein": 125.5,
            "carbs": 180.2,
            "fat": 65.8
          }
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /meal-plans
Create a new meal plan.

**Request Body:**
```json
{
  "name": "Week of January 1st",
  "description": "Healthy meal plan for the new year",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "preferences": {
    "dietary_restrictions": ["vegetarian"],
    "cuisine_preferences": ["italian", "mediterranean"],
    "cooking_time_limit": 60,
    "budget_range": "medium",
    "calorie_target": 2000
  }
}
```

### PUT /meal-plans/{id}/meals/{meal_id}
Update a specific meal in a meal plan.

**Request Body:**
```json
{
  "recipe_id": "uuid",
  "servings": 2,
  "scheduled_time": "19:30",
  "completed": true
}
```

### POST /meal-plans/{id}/generate-grocery-list
Generate a grocery list from a meal plan.

**Response:**
```json
{
  "id": "uuid",
  "meal_plan_id": "uuid",
  "items": [
    {
      "id": "uuid",
      "name": "Chicken breast",
      "quantity": 500,
      "unit": "g",
      "category": "Meat & Poultry",
      "estimated_cost": 4.50,
      "checked": false
    }
  ],
  "estimated_cost": 45.75,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Grocery Lists

### GET /grocery-lists
Get user's grocery lists.

### PUT /grocery-lists/{id}/items/{item_id}
Update a grocery list item.

**Request Body:**
```json
{
  "quantity": 750,
  "checked": true
}
```

### POST /grocery-lists/{id}/export
Export grocery list to text or PDF.

**Request Body:**
```json
{
  "format": "text"
}
```

## User Settings

### GET /settings
Get user settings.

**Response:**
```json
{
  "user_settings": {
    "display_name": "John D.",
    "profile_picture_url": "https://example.com/profile.jpg",
    "timezone": "Europe/London",
    "language": "en-GB",
    "theme": "dark",
    "units": "metric"
  },
  "notification_preferences": {
    "meal_prep_reminders": true,
    "shopping_list_notifications": true,
    "weekly_meal_plan_alerts": true,
    "notification_methods": {
      "email": true,
      "push": true,
      "sms": false
    }
  },
  "meal_planning_settings": {
    "weekly_meal_frequency": 21,
    "cooking_time_preference": "moderate",
    "household_size": 2,
    "weekly_budget_pounds": 50.00,
    "include_snacks": true
  }
}
```

### PUT /settings
Update user settings.

**Request Body:**
```json
{
  "user_settings": {
    "display_name": "John D.",
    "theme": "light",
    "units": "imperial"
  },
  "notification_preferences": {
    "meal_prep_reminders": false
  },
  "meal_planning_settings": {
    "weekly_budget_pounds": 60.00
  }
}
```

## Data Export

### POST /data/export
Request data export.

**Request Body:**
```json
{
  "export_type": "full",
  "format": "json"
}
```

**Response:**
```json
{
  "export_id": "uuid",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /data/export/{id}
Check export status.

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "file_url": "https://example.com/exports/user_data.json",
  "expires_at": "2024-01-08T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:05:00Z"
}
```

## Webhooks

### POST /webhooks/recipe-update
Receive notifications when recipes are updated.

**Request Body:**
```json
{
  "event": "recipe.updated",
  "recipe_id": "uuid",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

Error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

## Rate Limits

- **Standard Rate Limit**: 1000 requests per hour
- **Search Endpoints**: 100 requests per minute
- **Authentication Endpoints**: 10 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Versioning

The API uses URL versioning (e.g., `/v1/recipes`). When breaking changes are introduced, a new version will be released while maintaining support for previous versions for at least 6 months.

## Schema

OpenAPI 3.0 schema is available at `/schema.json` or `/docs/api`.

## SDKs and Client Libraries

- **JavaScript/TypeScript**: `npm install @lili-nutrition/api-client`
- **Python**: `pip install lili-nutrition-api`
- **Swift**: `pod 'LiliNutritionAPI'`
- **Kotlin**: `implementation 'app.lili.nutrition:api-client:1.0.0'`

## Support

For API support, please contact:
- Email: api-support@lili-nutrition.app
- Documentation: https://developers.lili-nutrition.app
- Status Page: https://status.lili-nutrition.app