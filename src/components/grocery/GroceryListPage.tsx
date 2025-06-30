import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Download, 
  Share2, 
  Check, 
  ShoppingCart,
  MoreVertical,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { groceryService } from '../../services/groceryService';
import { useAuth } from '../../hooks/useAuth';
import type { GroceryList, GroceryItem, UKGroceryCategory } from '../../types/recipe';

interface GroceryListPageProps {
  groceryList?: GroceryList;
  onBack: () => void;
  onGenerateFromMealPlan?: () => void;
}

export const GroceryListPage: React.FC<GroceryListPageProps> = ({
  groceryList: initialGroceryList,
  onBack,
  onGenerateFromMealPlan,
}) => {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(initialGroceryList || null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    category: 'Fresh Produce' as UKGroceryCategory,
  });
  
  const { user } = useAuth();

  const categories: UKGroceryCategory[] = [
    'Fresh Produce',
    'Meat & Poultry',
    'Fish & Seafood',
    'Dairy & Eggs',
    'Bakery',
    'Frozen Foods',
    'Pantry Essentials',
    'Herbs & Spices',
    'Beverages',
    'Household',
    'Health & Beauty',
  ];

  useEffect(() => {
    if (!initialGroceryList && user) {
      loadLatestGroceryList();
    }
  }, [user, initialGroceryList]);

  const loadLatestGroceryList = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const lists = await groceryService.getGroceryLists(user.id);
      if (lists.length > 0) {
        setGroceryList(lists[0]);
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemCheck = async (itemId: string) => {
    if (!groceryList) return;
    
    const newChecked = new Set(checkedItems);
    const isChecked = newChecked.has(itemId);
    
    if (isChecked) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    
    setCheckedItems(newChecked);
    
    // Update in database
    await groceryService.updateGroceryItem(groceryList.id, itemId, {
      checked: !isChecked
    });
  };

  const handleAddItem = () => {
    if (!groceryList || !newItem.name.trim()) return;
    
    const item: GroceryItem = {
      id: crypto.randomUUID(),
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      unit: newItem.unit,
      category: newItem.category,
      checked: false,
      estimated_cost: 2.00, // Default estimate
    };
    
    const updatedList = {
      ...groceryList,
      items: [...groceryList.items, item],
      estimated_cost: groceryList.estimated_cost + (item.estimated_cost || 0),
    };
    
    setGroceryList(updatedList);
    setNewItem({ name: '', quantity: 1, unit: '', category: 'Fresh Produce' });
    setShowAddForm(false);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!groceryList) return;
    
    const item = groceryList.items.find(i => i.id === itemId);
    const updatedList = {
      ...groceryList,
      items: groceryList.items.filter(i => i.id !== itemId),
      estimated_cost: groceryList.estimated_cost - (item?.estimated_cost || 0),
    };
    
    setGroceryList(updatedList);
    
    // Remove from checked items
    const newChecked = new Set(checkedItems);
    newChecked.delete(itemId);
    setCheckedItems(newChecked);
  };

  const handleExport = () => {
    if (!groceryList) return;
    
    const exportText = groceryService.exportGroceryList(groceryList);
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!groceryList) return;
    
    const shareText = groceryService.exportGroceryList(groceryList);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shopping List',
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      // You could show a toast notification here
    }
  };

  const groupedItems = groceryList?.items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, GroceryItem[]>) || {};

  const getCheckedCount = () => checkedItems.size;
  const getTotalItems = () => groceryList?.items.length || 0;
  const getProgressPercentage = () => {
    const total = getTotalItems();
    return total > 0 ? (getCheckedCount() / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#331442' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#331442' }}>
      {/* Header */}
      <div className="bg-primary-900/50 backdrop-blur-sm border-b border-primary-700/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="flex items-center gap-3">
              {groceryList && (
                <>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={handleExport}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Download size={20} />
                  </button>
                </>
              )}
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Shopping List</h1>
            <p className="text-gray-400">
              {groceryList 
                ? `Your personalised weekly plan`
                : 'No shopping list available'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {!groceryList ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No shopping list yet</h3>
            <p className="text-gray-400 mb-6">
              Generate a shopping list from your meal plan to get started
            </p>
            {onGenerateFromMealPlan && (
              <Button onClick={onGenerateFromMealPlan} variant="primary">
                Generate from Meal Plan
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-white font-medium">
                    {getCheckedCount()} of {getTotalItems()} items
                  </span>
                  <span className="text-gray-400 ml-2">•</span>
                  <span className="text-secondary-400 ml-2 font-medium">
                    Est. total £{groceryList.estimated_cost.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Item
                </Button>
              </div>
              
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div
                  className="bg-secondary-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Add Item Form */}
            {showAddForm && (
              <div className="bg-primary-800/50 border border-primary-700/50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Item</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
                    />
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as UKGroceryCategory })}
                      className="px-3 py-2 bg-primary-900 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-secondary-400"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g., kg, pieces)"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="px-3 py-2 bg-transparent border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddItem}
                      disabled={!newItem.name.trim()}
                      className="flex-1"
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Grocery Items by Category */}
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold text-white">{category}</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl p-4 transition-all duration-200 ${
                        checkedItems.has(item.id) ? 'opacity-60' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleItemCheck(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              checkedItems.has(item.id)
                                ? 'bg-secondary-400 border-secondary-400'
                                : 'border-gray-300 hover:border-secondary-400'
                            }`}
                          >
                            {checkedItems.has(item.id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              checkedItems.has(item.id) ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{item.quantity} {item.unit}</span>
                              {item.estimated_cost && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium text-secondary-600">
                                    £{item.estimated_cost.toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};