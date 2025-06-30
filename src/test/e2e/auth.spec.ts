import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page from splash screen', async ({ page }) => {
    await expect(page).toHaveURL('/auth/login');
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show validation errors for invalid email format', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.click('text=Sign up');
    
    await expect(page).toHaveURL('/auth/register');
    await expect(page.locator('h1')).toContainText('Create your account');
  });

  test('should show password requirements on register page', async ({ page }) => {
    await page.goto('/auth/register');
    
    await page.fill('input[placeholder="First name"]', 'John');
    await page.fill('input[placeholder="Last name"]', 'Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[placeholder="Password"]', 'weak');
    await page.fill('input[placeholder="Confirm password"]', 'weak');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should navigate to reset password page', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.click('text=Forgot your password?');
    
    await expect(page).toHaveURL('/auth/reset-password');
    await expect(page.locator('h1')).toContainText('Reset your password');
  });
});