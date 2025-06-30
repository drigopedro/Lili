import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should show error boundary for JavaScript errors', async ({ page }) => {
    // Mock a component that throws an error
    await page.addInitScript(() => {
      window.addEventListener('load', () => {
        // Simulate a component error
        const errorEvent = new ErrorEvent('error', {
          error: new Error('Test error'),
          message: 'Test error',
        });
        window.dispatchEvent(errorEvent);
      });
    });

    await page.goto('/dashboard');
    
    // Should show error boundary UI
    await expect(page.locator('text=Something went wrong')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('should show offline message when network is unavailable', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Simulate offline
    await page.context().setOffline(true);
    
    // Try to perform an action that requires network
    await page.click('button:has-text("Refresh")');
    
    // Should show offline indicator or error message
    await expect(page.locator('text=offline').or(page.locator('text=network'))).toBeVisible();
  });

  test('should handle form validation errors gracefully', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Submit form with invalid data
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[placeholder="Password"]', '123');
    await page.click('button[type="submit"]');
    
    // Should show validation errors without crashing
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    
    // Form should still be functional
    await page.fill('input[type="email"]', 'test@example.com');
    await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
  });

  test('should recover from errors using retry button', async ({ page }) => {
    // Mock an error that can be retried
    await page.route('**/api/recipes', route => {
      route.abort('failed');
    });

    await page.goto('/recipes');
    
    // Should show error state
    await expect(page.locator('text=error').or(page.locator('text=failed'))).toBeVisible();
    
    // Remove the route mock to simulate recovery
    await page.unroute('**/api/recipes');
    
    // Click retry button
    await page.click('button:has-text("Try Again")');
    
    // Should recover and show content
    await expect(page.locator('text=Recipes')).toBeVisible();
  });
});