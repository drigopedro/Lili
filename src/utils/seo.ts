// SEO utilities for dynamic meta tag generation

interface MetaTagsConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'recipe';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  recipeData?: RecipeStructuredData;
}

interface RecipeStructuredData {
  name: string;
  description: string;
  image: string;
  prepTime: string; // ISO 8601 duration format (e.g., "PT15M")
  cookTime: string; // ISO 8601 duration format
  totalTime: string; // ISO 8601 duration format
  recipeYield: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  keywords?: string;
  recipeIngredient: string[];
  recipeInstructions: string[];
  nutrition?: {
    calories: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
    fiberContent?: string;
    sugarContent?: string;
    sodiumContent?: string;
  };
  author?: {
    name: string;
    url?: string;
  };
}

/**
 * Updates document meta tags for SEO
 */
export const updateMetaTags = (config: MetaTagsConfig): void => {
  // Update document title
  document.title = config.title;
  
  // Basic meta tags
  updateMetaTag('description', config.description);
  if (config.keywords && config.keywords.length > 0) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }
  if (config.author) {
    updateMetaTag('author', config.author);
  }
  
  // Open Graph meta tags
  updateMetaTag('og:title', config.title);
  updateMetaTag('og:description', config.description);
  updateMetaTag('og:type', config.type || 'website');
  
  if (config.url) {
    updateMetaTag('og:url', config.url);
  }
  
  if (config.image) {
    updateMetaTag('og:image', config.image);
  }
  
  // Twitter Card meta tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', config.title);
  updateMetaTag('twitter:description', config.description);
  
  if (config.image) {
    updateMetaTag('twitter:image', config.image);
  }
  
  // Article specific meta tags
  if (config.type === 'article') {
    if (config.publishedTime) {
      updateMetaTag('article:published_time', config.publishedTime);
    }
    if (config.modifiedTime) {
      updateMetaTag('article:modified_time', config.modifiedTime);
    }
  }
  
  // Add recipe structured data if provided
  if (config.type === 'recipe' && config.recipeData) {
    addRecipeStructuredData(config.recipeData);
  }
};

/**
 * Updates or creates a meta tag
 */
const updateMetaTag = (name: string, content: string): void => {
  // Check if the meta tag already exists
  let metaTag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  if (!metaTag) {
    // Create meta tag if it doesn't exist
    metaTag = document.createElement('meta');
    
    // Determine if this is a name or property attribute
    if (name.startsWith('og:') || name.startsWith('twitter:') || name.startsWith('article:')) {
      metaTag.setAttribute('property', name);
    } else {
      metaTag.setAttribute('name', name);
    }
    
    document.head.appendChild(metaTag);
  }
  
  // Update content
  metaTag.setAttribute('content', content);
};

/**
 * Adds recipe structured data to the page
 */
const addRecipeStructuredData = (recipeData: RecipeStructuredData): void => {
  // Remove any existing recipe schema
  const existingSchema = document.querySelector('script[type="application/ld+json"]');
  if (existingSchema) {
    existingSchema.remove();
  }
  
  // Create the structured data script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  
  // Build the schema.org Recipe object
  const schemaData = {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipeData.name,
    description: recipeData.description,
    image: recipeData.image,
    prepTime: recipeData.prepTime,
    cookTime: recipeData.cookTime,
    totalTime: recipeData.totalTime,
    recipeYield: recipeData.recipeYield,
    recipeCategory: recipeData.recipeCategory,
    recipeCuisine: recipeData.recipeCuisine,
    keywords: recipeData.keywords,
    recipeIngredient: recipeData.recipeIngredient,
    recipeInstructions: recipeData.recipeInstructions.map(step => ({
      '@type': 'HowToStep',
      'text': step
    })),
    author: recipeData.author ? {
      '@type': 'Person',
      'name': recipeData.author.name,
      'url': recipeData.author.url
    } : undefined,
    nutrition: recipeData.nutrition ? {
      '@type': 'NutritionInformation',
      'calories': recipeData.nutrition.calories,
      'proteinContent': recipeData.nutrition.proteinContent,
      'carbohydrateContent': recipeData.nutrition.carbohydrateContent,
      'fatContent': recipeData.nutrition.fatContent,
      'fiberContent': recipeData.nutrition.fiberContent,
      'sugarContent': recipeData.nutrition.sugarContent,
      'sodiumContent': recipeData.nutrition.sodiumContent
    } : undefined
  };
  
  script.textContent = JSON.stringify(schemaData);
  document.head.appendChild(script);
};

/**
 * Generates a canonical URL for the current page
 */
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://lili-nutrition.app';
  const canonicalPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  return `${baseUrl}${canonicalPath}`;
};

/**
 * Updates the canonical URL tag
 */
export const updateCanonicalUrl = (path: string): void => {
  const canonicalUrl = generateCanonicalUrl(path);
  
  // Look for existing canonical tag
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  
  if (!canonicalTag) {
    // Create if it doesn't exist
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  
  // Update href
  canonicalTag.setAttribute('href', canonicalUrl);
};

/**
 * Generates meta tags for a recipe page
 */
export const generateRecipeMetaTags = (recipe: any): MetaTagsConfig => {
  // Convert prep and cook times to ISO 8601 duration format
  const prepTimeISO = `PT${recipe.prep_time}M`;
  const cookTimeISO = `PT${recipe.cook_time}M`;
  const totalTimeISO = `PT${recipe.prep_time + recipe.cook_time}M`;
  
  return {
    title: `${recipe.name} Recipe | Lili Nutrition`,
    description: recipe.description || `Discover how to make ${recipe.name} with this easy recipe from Lili Nutrition.`,
    image: recipe.image_url,
    type: 'recipe',
    keywords: recipe.tags || [],
    recipeData: {
      name: recipe.name,
      description: recipe.description || `A delicious recipe for ${recipe.name}`,
      image: recipe.image_url,
      prepTime: prepTimeISO,
      cookTime: cookTimeISO,
      totalTime: totalTimeISO,
      recipeYield: `${recipe.servings} serving${recipe.servings !== 1 ? 's' : ''}`,
      recipeCategory: recipe.tags?.[0] || 'Main Course',
      recipeCuisine: recipe.cuisine_type || '',
      keywords: recipe.tags?.join(', ') || '',
      recipeIngredient: recipe.ingredients.map((ing: any) => 
        `${ing.quantity} ${ing.unit} ${ing.name}`
      ),
      recipeInstructions: recipe.instructions,
      nutrition: {
        calories: `${recipe.nutrition.calories} calories`,
        proteinContent: `${recipe.nutrition.protein}g`,
        carbohydrateContent: `${recipe.nutrition.carbs}g`,
        fatContent: `${recipe.nutrition.fat}g`,
        fiberContent: `${recipe.nutrition.fibre}g`,
        sugarContent: `${recipe.nutrition.sugar}g`,
        sodiumContent: `${recipe.nutrition.sodium}mg`
      },
      author: {
        name: 'Lili Nutrition',
        url: 'https://lili-nutrition.app'
      }
    }
  };
};

/**
 * Generates a dynamic sitemap for the application
 */
export const generateSitemap = async (): Promise<string> => {
  // This would typically fetch data from your API
  // For demonstration, we'll create a simple example
  
  const baseUrl = 'https://lili-nutrition.app';
  const today = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/recipes', priority: 0.9, changefreq: 'daily' },
    { url: '/meal-planning', priority: 0.8, changefreq: 'weekly' },
    { url: '/about', priority: 0.6, changefreq: 'monthly' },
    { url: '/contact', priority: 0.5, changefreq: 'monthly' }
  ];
  
  // Start XML content
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Close XML
  xml += '</urlset>';
  
  return xml;
};

export default {
  updateMetaTags,
  updateCanonicalUrl,
  generateRecipeMetaTags,
  generateSitemap
};