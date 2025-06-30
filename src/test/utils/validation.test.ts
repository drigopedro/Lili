import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateForm,
  hasValidationErrors,
} from '../../utils/validation';

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('returns error for invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
      expect(validateEmail('test@')).toBe('Please enter a valid email address');
      expect(validateEmail('@example.com')).toBe('Please enter a valid email address');
    });

    it('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@example.co.uk')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('returns error for short password', () => {
      expect(validatePassword('1234567')).toBe('Password must be at least 8 characters long');
    });

    it('returns error for password without lowercase', () => {
      expect(validatePassword('PASSWORD123')).toBe('Password must contain at least one lowercase letter');
    });

    it('returns error for password without uppercase', () => {
      expect(validatePassword('password123')).toBe('Password must contain at least one uppercase letter');
    });

    it('returns error for password without number', () => {
      expect(validatePassword('Password')).toBe('Password must contain at least one number');
    });

    it('returns null for valid password', () => {
      expect(validatePassword('Password123')).toBeNull();
      expect(validatePassword('MySecureP@ss1')).toBeNull();
    });
  });

  describe('validateRequired', () => {
    it('returns error for empty values', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required');
      expect(validateRequired(null, 'Name')).toBe('Name is required');
      expect(validateRequired(undefined, 'Name')).toBe('Name is required');
    });

    it('returns null for non-empty values', () => {
      expect(validateRequired('value', 'Name')).toBeNull();
      expect(validateRequired(0, 'Age')).toBeNull();
      expect(validateRequired(false, 'Checkbox')).toBeNull();
    });
  });

  describe('validateForm', () => {
    const rules = {
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      password: { required: true, minLength: 8 },
      name: { required: true, minLength: 2, maxLength: 50 },
    };

    it('returns errors for invalid form data', () => {
      const data = {
        email: 'invalid-email',
        password: '123',
        name: '',
      };

      const errors = validateForm(data, rules);

      expect(errors.email).toBeTruthy();
      expect(errors.password).toBeTruthy();
      expect(errors.name).toBeTruthy();
    });

    it('returns no errors for valid form data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'John Doe',
      };

      const errors = validateForm(data, rules);

      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('hasValidationErrors', () => {
    it('returns true when errors exist', () => {
      const errors = { email: 'Invalid email', password: 'Too short' };
      expect(hasValidationErrors(errors)).toBe(true);
    });

    it('returns false when no errors exist', () => {
      const errors = {};
      expect(hasValidationErrors(errors)).toBe(false);
    });
  });
});