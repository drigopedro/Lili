export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number): string | null => {
  if (value && value.length < minLength) {
    return `Must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number): string | null => {
  if (value && value.length > maxLength) {
    return `Must be no more than ${maxLength} characters long`;
  }
  return null;
};

export const validatePattern = (value: string, pattern: RegExp, message: string): string | null => {
  if (value && !pattern.test(value)) {
    return message;
  }
  return null;
};

export const validateField = (value: any, rules: ValidationRule, fieldName: string): string | null => {
  // Required validation
  if (rules.required) {
    const requiredError = validateRequired(value, fieldName);
    if (requiredError) return requiredError;
  }
  
  // Skip other validations if value is empty and not required
  if (!value && !rules.required) return null;
  
  // Min length validation
  if (rules.minLength) {
    const minLengthError = validateMinLength(value, rules.minLength);
    if (minLengthError) return minLengthError;
  }
  
  // Max length validation
  if (rules.maxLength) {
    const maxLengthError = validateMaxLength(value, rules.maxLength);
    if (maxLengthError) return maxLengthError;
  }
  
  // Pattern validation
  if (rules.pattern) {
    const patternError = validatePattern(value, rules.pattern, `Invalid ${fieldName.toLowerCase()} format`);
    if (patternError) return patternError;
  }
  
  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }
  
  return null;
};

export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  Object.keys(rules).forEach(fieldName => {
    const value = data[fieldName];
    const fieldRules = rules[fieldName];
    const error = validateField(value, fieldRules, fieldName);
    
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Specific validation functions for common use cases
export const validateName = (name: string): string | null => {
  return validateField(name, {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  }, 'Name');
};

export const validateAge = (age: number): string | null => {
  if (!age) return 'Age is required';
  if (age < 13) return 'You must be at least 13 years old';
  if (age > 120) return 'Please enter a valid age';
  return null;
};

export const validateWeight = (weight: number): string | null => {
  if (!weight) return 'Weight is required';
  if (weight < 20) return 'Weight must be at least 20 kg';
  if (weight > 500) return 'Please enter a valid weight';
  return null;
};

export const validateHeight = (height: number): string | null => {
  if (!height) return 'Height is required';
  if (height < 100) return 'Height must be at least 100 cm';
  if (height > 250) return 'Please enter a valid height';
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return null; // Optional field
  
  const phoneRegex = /^(\+44|0)[1-9]\d{8,9}$/; // UK phone number format
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid UK phone number';
  }
  
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null; // Optional field
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

export const validateDateOfBirth = (date: string): string | null => {
  if (!date) return 'Date of birth is required';
  
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (birthDate > today) {
    return 'Date of birth cannot be in the future';
  }
  
  if (age < 13) {
    return 'You must be at least 13 years old';
  }
  
  if (age > 120) {
    return 'Please enter a valid date of birth';
  }
  
  return null;
};