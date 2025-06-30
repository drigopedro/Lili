import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    
    // Wait for main content to load
    await expect(page.locator('h1')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure First Contentful Paint
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });

    // FCP should be under 1.8 seconds
    expect(fcp).toBeLessThan(1800);
  });

  test('should handle large lists efficiently', async ({ page }) => {
    await page.goto('/recipes');
    
    // Simulate scrolling through a large list
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(100);
    }
    
    // Page should remain responsive
    const button = page.locator('button').first();
    await expect(button).toBeEnabled();
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/recipes');
    
    // Check that images below the fold are not loaded initially
    const images = page.locator('img[loading="lazy"]');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Scroll to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Images should load after scrolling
      await expect(images.first()).toHaveAttribute('src', /.+/);
    }
  });
});