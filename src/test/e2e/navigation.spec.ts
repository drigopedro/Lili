import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'mock-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should show bottom navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('/dashboard');
    
    const bottomNav = page.locator('[data-testid="bottom-navigation"]');
    await expect(bottomNav).toBeVisible();
    
    // Check all navigation items
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Meals')).toBeVisible();
    await expect(page.locator('text=Recipes')).toBeVisible();
    await expect(page.locator('text=Shopping')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('should navigate between pages using bottom navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Navigate to recipes
    await page.click('text=Recipes');
    await expect(page).toHaveURL('/recipes');
    
    // Navigate to meal planning
    await page.click('text=Meals');
    await expect(page).toHaveURL('/meal-planning');
    
    // Navigate back to dashboard
    await page.click('text=Home');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should hide bottom navigation on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop size
    await page.goto('/dashboard');
    
    const bottomNav = page.locator('[data-testid="bottom-navigation"]');
    await expect(bottomNav).not.toBeVisible();
  });
});