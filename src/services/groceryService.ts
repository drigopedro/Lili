import { supabase } from '../lib/supabase';
import type { GroceryList, GroceryItem, UKGroceryCategory } from '../types/recipe';
import type { WeeklyMealPlan } from '../types/meal-planning';

class GroceryService {
  // UK-specific grocery categories with typical items
  private readonly ukCategories: Record<UKGroceryCategory, string[]> = {
    'Fresh Produce': ['fruits', 'vegetables', 'herbs', 'salads'],
    'Meat & Poultry': ['beef', 'pork', 'lamb', 'chicken', 'turkey', 'bacon', 'sausages'],
    'Fish & Seafood': ['salmon', 'cod', 'prawns', 'tuna', 'mackerel', 'haddock'],
    'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'],
    'Bakery': ['bread', 'rolls', 'pastry', 'cakes', 'biscuits'],
    'Frozen Foods': ['frozen vegetables', 'frozen fruits', 'ice cream', 'frozen meals'],
    'Pantry Essentials': ['rice', 'pasta', 'flour', 'oil', 'vinegar', 'tinned goods'],
    'Herbs & Spices': ['salt', 'pepper', 'garlic', 'ginger', 'basil', 'oregano'],
    'Beverages': ['water', 'juice', 'tea', 'coffee', 'soft drinks'],
    'Household': ['cleaning products', 'toiletries', 'kitchen roll'],
    'Health & Beauty': ['vitamins', 'supplements', 'personal care'],
  };

  // UK-specific unit conversions
  private readonly ukUnits: Record<string, string> = {
    'cup': 'ml',
    'cups': 'ml',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'ounce': 'g',
    'ounces': 'g',
    'pound': 'g',
    'pounds': 'g',
    'fluid ounce': 'ml',
    'fluid ounces': 'ml',
    'pint': 'ml',
    'pints': 'ml',
    'quart': 'litre',
    'quarts': 'litre',
    'gallon': 'litre',
    'gallons': 'litre',
  };

  // Generate grocery list from meal plan
  async generateGroceryList(userId: string, mealPlan: WeeklyMealPlan): Promise<GroceryList> {
    try {
      const ingredients = await this.extractIngredientsFromMealPlan(mealPlan);
      const consolidatedItems = this.consolidateIngredients(ingredients);
      const categorizedItems = this.categorizeItems(consolidatedItems);
      const itemsWithCosts = this.estimateCosts(categorizedItems);

      const groceryList: GroceryList = {
        id: crypto.randomUUID(),
        user_id: userId,
        meal_plan_id: mealPlan.id,
        items: itemsWithCosts,
        estimated_cost: itemsWithCosts.reduce((total, item) => total + (item.estimated_cost || 0), 0),
        created_at: new Date().toISOString(),
      };

      // Save to database
      const { data, error } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: groceryList.user_id,
          meal_plan_id: groceryList.meal_plan_id,
          items: groceryList.items,
          estimated_cost: groceryList.estimated_cost,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...groceryList,
        id: data.id,
      };
    } catch (error) {
      console.error('Error generating grocery list:', error);
      throw error;
    }
  }

  // Get user's grocery lists
  async getGroceryLists(userId: string): Promise<GroceryList[]> {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(list => ({
        id: list.id,
        user_id: list.user_id,
        meal_plan_id: list.meal_plan_id,
        items: list.items || [],
        estimated_cost: list.estimated_cost || 0,
        created_at: list.created_at,
      })) || [];
    } catch (error) {
      console.error('Error fetching grocery lists:', error);
      return [];
    }
  }

  // Get a specific grocery list
  async getGroceryList(listId: string): Promise<GroceryList | null> {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('id', listId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        user_id: data.user_id,
        meal_plan_id: data.meal_plan_id,
        items: data.items || [],
        estimated_cost: data.estimated_cost || 0,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching grocery list:', error);
      return null;
    }
  }

  // Update grocery list item
  async updateGroceryItem(listId: string, itemId: string, updates: Partial<GroceryItem>): Promise<boolean> {
    try {
      // Get current list
      const { data: currentList, error: fetchError } = await supabase
        .from('grocery_lists')
        .select('items')
        .eq('id', listId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (fetchError) throw fetchError;
      if (!currentList) return false;

      const items = currentList.items || [];
      const itemIndex = items.findIndex((item: GroceryItem) => item.id === itemId);

      if (itemIndex === -1) return false;

      // Update the item
      items[itemIndex] = { ...items[itemIndex], ...updates };

      // Save back to database
      const { error: updateError } = await supabase
        .from('grocery_lists')
        .update({ items })
        .eq('id', listId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error updating grocery item:', error);
      return false;
    }
  }

  // Export grocery list as text
  exportGroceryList(groceryList: GroceryList): string {
    const groupedItems = this.groupItemsByCategory(groceryList.items);
    let exportText = `Shopping List - ${new Date(groceryList.created_at).toLocaleDateString('en-GB')}\n`;
    exportText += `Estimated Total: £${groceryList.estimated_cost.toFixed(2)}\n\n`;

    Object.entries(groupedItems).forEach(([category, items]) => {
      exportText += `${category.toUpperCase()}\n`;
      exportText += '─'.repeat(category.length) + '\n';
      
      items.forEach(item => {
        const cost = item.estimated_cost ? ` (£${item.estimated_cost.toFixed(2)})` : '';
        exportText += `□ ${item.name} - ${item.quantity} ${item.unit}${cost}\n`;
      });
      
      exportText += '\n';
    });

    return exportText;
  }

  private async extractIngredientsFromMealPlan(mealPlan: WeeklyMealPlan): Promise<GroceryItem[]> {
    const ingredients: GroceryItem[] = [];

    for (const dailyPlan of mealPlan.daily_plans) {
      for (const meal of dailyPlan.meals) {
        // In a real implementation, we would fetch recipe ingredients
        // For now, we'll generate sample ingredients based on meal names
        const mealIngredients = this.generateSampleIngredients(meal.name);
        ingredients.push(...mealIngredients);
      }
    }

    return ingredients;
  }

  private generateSampleIngredients(mealName: string): GroceryItem[] {
    // This is a simplified version - in reality, you'd fetch from recipe_ingredients table
    const commonIngredients = [
      { name: 'Chicken breast', quantity: 500, unit: 'g', category: 'Meat & Poultry' as UKGroceryCategory },
      { name: 'Brown rice', quantity: 200, unit: 'g', category: 'Pantry Essentials' as UKGroceryCategory },
      { name: 'Broccoli', quantity: 300, unit: 'g', category: 'Fresh Produce' as UKGroceryCategory },
      { name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'Pantry Essentials' as UKGroceryCategory },
      { name: 'Garlic', quantity: 2, unit: 'cloves', category: 'Fresh Produce' as UKGroceryCategory },
    ];

    return commonIngredients.map(ingredient => ({
      id: crypto.randomUUID(),
      ...ingredient,
      checked: false,
    }));
  }

  private consolidateIngredients(ingredients: GroceryItem[]): GroceryItem[] {
    const consolidated = new Map<string, GroceryItem>();

    ingredients.forEach(ingredient => {
      const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
      
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!;
        existing.quantity += ingredient.quantity;
      } else {
        consolidated.set(key, { ...ingredient });
      }
    });

    return Array.from(consolidated.values());
  }

  private categorizeItems(items: GroceryItem[]): GroceryItem[] {
    return items.map(item => {
      if (item.category) return item;

      // Auto-categorize based on item name
      const itemName = item.name.toLowerCase();
      
      for (const [category, keywords] of Object.entries(this.ukCategories)) {
        if (keywords.some(keyword => itemName.includes(keyword))) {
          return { ...item, category: category as UKGroceryCategory };
        }
      }

      return { ...item, category: 'Pantry Essentials' as UKGroceryCategory };
    });
  }

  private estimateCosts(items: GroceryItem[]): GroceryItem[] {
    // UK-specific price estimates (in pounds)
    const priceEstimates: Record<string, number> = {
      'chicken breast': 6.50, // per kg
      'salmon fillet': 12.00, // per kg
      'beef mince': 5.00, // per kg
      'brown rice': 2.50, // per kg
      'pasta': 1.20, // per kg
      'broccoli': 2.00, // per kg
      'carrots': 0.80, // per kg
      'milk': 1.30, // per litre
      'eggs': 2.50, // per dozen
      'bread': 1.20, // per loaf
      'cheese': 8.00, // per kg
      'olive oil': 4.50, // per 500ml
    };

    return items.map(item => {
      const basePrice = priceEstimates[item.name.toLowerCase()] || 2.00;
      const unitMultiplier = this.getUnitMultiplier(item.unit);
      const estimatedCost = (basePrice * item.quantity * unitMultiplier) / 1000; // Convert to appropriate scale

      return {
        ...item,
        estimated_cost: Math.max(0.10, Math.round(estimatedCost * 100) / 100), // Minimum 10p
      };
    });
  }

  private getUnitMultiplier(unit: string): number {
    const multipliers: Record<string, number> = {
      'g': 1,
      'kg': 1000,
      'ml': 1,
      'litre': 1000,
      'piece': 100,
      'pieces': 100,
      'clove': 10,
      'cloves': 10,
      'tbsp': 15,
      'tsp': 5,
    };

    return multipliers[unit.toLowerCase()] || 1;
  }

  private groupItemsByCategory(items: GroceryItem[]): Record<string, GroceryItem[]> {
    return items.reduce((groups, item) => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, GroceryItem[]>);
  }
}

export const groceryService = new GroceryService();