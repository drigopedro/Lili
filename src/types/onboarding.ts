export interface OnboardingData {
  // Step 1: Age & Gender
  ageRange?: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Step 2: Health Profile
  healthConditions?: string[];
  allergies?: string[];
  medications?: string[];
  
  // Step 3: Health Goals
  healthGoals?: string[];
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  
  // Step 4: Lifestyle
  lifestyleFactors?: string[];
  cookingExperience?: 'beginner' | 'intermediate' | 'advanced';
  timeAvailable?: 'minimal' | 'moderate' | 'plenty';
  
  // Step 5: Preferences
  cuisineTypes?: string[];
  cookingTimePreference?: 'quick' | 'moderate' | 'long' | 'any';
  mealComplexity?: 'simple' | 'moderate' | 'complex' | 'any';
  budgetRange?: 'low' | 'medium' | 'high' | 'any';
}

export interface OnboardingProgress {
  id: string;
  userId: string;
  currentStep: number;
  completedSteps: number[];
  stepData: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  ageRange?: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  healthGoals?: string[];
  dietaryRestrictions?: string[];
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  lifestyleFactors?: string[];
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealPreferences {
  id: string;
  userId: string;
  cuisineTypes: string[];
  cookingTimePreference: 'quick' | 'moderate' | 'long' | 'any';
  mealComplexity: 'simple' | 'moderate' | 'complex' | 'any';
  budgetRange: 'low' | 'medium' | 'high' | 'any';
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  mealTimingPreferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}