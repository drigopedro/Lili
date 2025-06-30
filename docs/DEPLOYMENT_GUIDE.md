# 🚀 Lili Nutrition App - Deployment Guide

This guide provides detailed instructions for deploying the Lili Nutrition App to production environments. Follow these steps carefully to ensure a successful deployment.

## 📋 Prerequisites

Before deployment, ensure you have:

- Node.js v18.x or higher
- npm v9.x or higher
- Access to the production Supabase project
- AWS S3 or equivalent storage for static assets
- CDN provider account (Cloudflare, Fastly, etc.)
- SSL certificate for your domain
- DNS access for your domain

## 🔑 Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following variables:

```
# API Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://api.lili-nutrition.app/v1

# Analytics and Monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn

# PWA Configuration
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key

# Feature Flags
VITE_ENABLE_SOCIAL_SHARING=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

### Sensitive Secrets Management

For sensitive secrets, use a secure secrets management solution:

1. **AWS Secrets Manager**:
   ```bash
   aws secretsmanager get-secret-value --secret-id lili-nutrition-app-secrets
   ```

2. **GitHub Secrets** (for CI/CD):
   Configure in your repository settings under Secrets and Variables > Actions

## 🏗️ Build Process

### Production Build

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

### Build Optimization

The build process includes:

1. **Code Splitting**: Separates vendor code for better caching
2. **Tree Shaking**: Removes unused code
3. **Asset Optimization**: Compresses images and CSS/JS
4. **Source Maps**: Generated for production debugging

### Build Verification

Before deployment, verify the build:

```bash
# Run production build tests
npm run test:prod

# Check bundle size
npm run analyze
```

## 🚢 Deployment Procedures

### Netlify Deployment

1. **Connect Repository**:
   - Log in to Netlify
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables from `.env.production`

3. **Configure Custom Domain**:
   - Go to Site settings > Domain management
   - Add custom domain: `lili-nutrition.app`
   - Enable HTTPS

### Vercel Deployment

1. **Connect Repository**:
   - Log in to Vercel
   - Click "Import Project"
   - Select your repository

2. **Configure Project**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variables

3. **Configure Domain**:
   - Go to Project Settings > Domains
   - Add domain: `lili-nutrition.app`

### Manual Deployment

For custom hosting solutions:

1. **Build the Application**:
   ```bash
   npm ci
   npm run build
   ```

2. **Deploy to Web Server**:
   ```bash
   # Example using AWS S3
   aws s3 sync dist/ s3://lili-nutrition-app --delete
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## 🔒 Security Configuration

### HTTP Security Headers

Configure your web server or CDN with these security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.example.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.pexels.com https://storage.googleapis.com; connect-src 'self' https://your-project.supabase.co https://api.lili-nutrition.app;
```

### CORS Configuration

Configure CORS on your API server:

```
Access-Control-Allow-Origin: https://lili-nutrition.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## 📊 Monitoring Setup

### Performance Monitoring

1. **Set up Web Vitals tracking**:
   ```javascript
   import { getCLS, getFID, getLCP } from 'web-vitals';
   
   function sendToAnalytics(metric) {
     const body = JSON.stringify({
       name: metric.name,
       value: metric.value,
       id: 'user-id'
     });
     
     navigator.sendBeacon('/analytics', body);
   }
   
   getCLS(sendToAnalytics);
   getFID(sendToAnalytics);
   getLCP(sendToAnalytics);
   ```

2. **Configure Sentry for error tracking**:
   ```javascript
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: 'production',
     tracesSampleRate: 0.2,
   });
   ```

### Health Checks

Set up health check endpoints:

- `/api/health`: API health status
- `/health`: Frontend application health

Configure uptime monitoring with alerts for any downtime.

## 🔄 Continuous Integration/Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Deployment Strategies

1. **Blue-Green Deployment**:
   - Deploy to a new environment
   - Run smoke tests
   - Switch traffic when verified

2. **Canary Releases**:
   - Deploy to a subset of users (5-10%)
   - Monitor for errors
   - Gradually increase traffic

## 🔍 SEO Configuration

### Meta Tags

Ensure these meta tags are present in `index.html`:

```html
<meta name="description" content="Your personal guide to eating well with AI-powered meal planning, nutrition tracking, and recipe recommendations.">
<meta name="keywords" content="nutrition, meal planning, recipes, health, diet, wellness">
<meta name="author" content="Lili Nutrition">

<!-- Open Graph Tags -->
<meta property="og:title" content="Lili - Your Personal Guide to Eating Well">
<meta property="og:description" content="AI-powered meal planning and nutrition tracking for a healthier lifestyle.">
<meta property="og:image" content="https://lili-nutrition.app/og-image.jpg">
<meta property="og:url" content="https://lili-nutrition.app">
<meta property="og:type" content="website">

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Lili - Your Personal Guide to Eating Well">
<meta name="twitter:description" content="AI-powered meal planning and nutrition tracking for a healthier lifestyle.">
<meta name="twitter:image" content="https://lili-nutrition.app/twitter-image.jpg">
```

### Sitemap and Robots.txt

1. **Sitemap**: Generate and submit to search engines
2. **Robots.txt**: Configure for proper crawling

### Structured Data

Add Recipe schema markup for recipe pages:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Recipe",
  "name": "Italian Chicken Parmesan",
  "image": "https://lili-nutrition.app/images/chicken-parmesan.jpg",
  "description": "Classic Italian chicken dish with crispy coating",
  "keywords": "chicken, italian, parmesan",
  "author": {
    "@type": "Organization",
    "name": "Lili Nutrition"
  },
  "prepTime": "PT15M",
  "cookTime": "PT30M",
  "totalTime": "PT45M",
  "recipeYield": "4 servings",
  "recipeCategory": "Main Course",
  "recipeCuisine": "Italian",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "450 calories",
    "proteinContent": "35.2 g",
    "carbohydrateContent": "25.1 g",
    "fatContent": "22.8 g",
    "fiberContent": "3.2 g",
    "sodiumContent": "680 mg"
  },
  "recipeIngredient": [
    "500g chicken breast",
    "100g breadcrumbs",
    "50g parmesan cheese"
  ],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "text": "Preheat oven to 200°C"
    },
    {
      "@type": "HowToStep",
      "text": "Season chicken breasts with salt and pepper"
    }
  ]
}
</script>
```

## 🔄 Database Migrations

### Supabase Migrations

1. **Apply migrations**:
   ```bash
   supabase db push
   ```

2. **Verify migrations**:
   ```bash
   supabase db diff
   ```

## 📱 PWA Configuration

### Service Worker

Ensure the service worker is properly registered:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

### Web App Manifest

Verify `manifest.json` is correctly configured:

```json
{
  "name": "Lili - Nutrition Therapy",
  "short_name": "Lili",
  "description": "Your personal guide to eating well with AI-powered meal planning and nutrition tracking",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#331442",
  "theme_color": "#331442",
  "icons": [
    {
      "src": "/Lili-logo.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/Lili-logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 🧪 Post-Deployment Verification

### Automated Tests

Run post-deployment tests:

```bash
# E2E tests against production
npm run test:e2e:prod

# Lighthouse audit
npm run lighthouse
```

### Manual Verification Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Confirm recipe search functionality
- [ ] Test meal planning features
- [ ] Verify shopping list generation
- [ ] Check offline functionality
- [ ] Test push notifications
- [ ] Verify social sharing
- [ ] Test on multiple devices and browsers

## 🔄 Rollback Procedures

### Automated Rollback

If monitoring detects critical issues:

```bash
# Trigger rollback to previous stable version
npm run deploy:rollback
```

### Manual Rollback

1. **Revert to previous deployment**:
   ```bash
   # Netlify
   netlify deploy --prod --dir=dist --site-id=$SITE_ID --auth=$AUTH_TOKEN --message="Rollback to v1.2.3"
   
   # Vercel
   vercel rollback --prod
   ```

2. **Revert database migrations if necessary**:
   ```bash
   supabase db reset --db-url=$SUPABASE_DB_URL
   ```

## 📊 Analytics and Tracking

### Google Analytics Setup

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Custom Event Tracking

```javascript
// Track recipe view
gtag('event', 'view_item', {
  'event_category': 'recipe',
  'event_label': 'Italian Chicken Parmesan',
  'value': 1
});

// Track meal plan creation
gtag('event', 'create_plan', {
  'event_category': 'meal_planning',
  'event_label': 'Weekly Plan',
  'value': 1
});
```

## 🔐 Backup and Disaster Recovery

### Database Backups

Supabase automatically creates daily backups. To manually create a backup:

```bash
supabase db dump -f backup.sql
```

### Disaster Recovery Plan

1. **Data Loss**:
   - Restore from latest backup
   - Run data integrity checks
   - Notify affected users

2. **Service Outage**:
   - Deploy to backup infrastructure
   - Update DNS records
   - Monitor recovery

## 📞 Support and Contact

For deployment issues, contact:

- **DevOps Team**: devops@lili-nutrition.app
- **Emergency Support**: +44 123 456 7890
- **Status Page**: https://status.lili-nutrition.app

## 📝 Changelog

- **v1.0.0** (2024-01-01): Initial production release
- **v1.0.1** (2024-01-15): Performance optimizations
- **v1.1.0** (2024-02-01): Added social sharing features
- **v1.2.0** (2024-03-01): Enhanced recipe search and filtering