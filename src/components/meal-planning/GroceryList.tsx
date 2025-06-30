import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { GroceryItem } from '../../types/meal-planning';

interface GroceryListProps {
  items: GroceryItem[];
  onUpdateItem?: (itemId: string, updates: Partial<GroceryItem>) => void;
  onAddItem?: (item: Omit<GroceryItem, 'id'>) => void;
  onRemoveItem?: (itemId: string) => void;
}

export const GroceryList: React.FC<GroceryListProps> = ({
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    category: 'Other',
  });

  const categories = ['Produce', 'Meat', 'Dairy', 'Pantry', 'Frozen', 'Other'];
  
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const toggleCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && onAddItem) {
      onAddItem({
        ...newItem,
        name: newItem.name.trim(),
      });
      setNewItem({ name: '', quantity: 1, unit: '', category: 'Other' });
      setShowAddForm(false);
    }
  };

  const getTotalCost = () => {
    return items.reduce((total, item) => total + (item.estimated_cost || 0), 0);
  };

  const getCheckedCount = () => {
    return checkedItems.size;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-5 h-5 text-secondary-400" />
            <h2 className="text-xl font-semibold text-white">Grocery List</h2>
          </div>
          <p className="text-gray-400">
            {getCheckedCount()}/{items.length} items • Est. ${getTotalCost().toFixed(2)}
          </p>
        </div>
        {onAddItem && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Shopping Progress</span>
          <span className="text-white font-medium">
            {Math.round((getCheckedCount() / Math.max(items.length, 1)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-primary-700 rounded-full h-2">
          <div
            className="bg-secondary-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getCheckedCount() / Math.max(items.length, 1)) * 100}%` }}
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
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
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
                placeholder="Unit (e.g., lbs, pieces)"
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
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{category}</h3>
          <div className="space-y-2">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl p-4 transition-all duration-200 ${
                  checkedItems.has(item.id) ? 'opacity-60' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCheck(item.id)}
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
                    <div>
                      <h4 className={`font-medium ${
                        checkedItems.has(item.id) ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit}
                        {item.estimated_cost && (
                          <span className="ml-2">• ${item.estimated_cost.toFixed(2)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No items in your list</h3>
          <p className="text-gray-400 mb-4">
            Add items manually or generate from your meal plan
          </p>
        </div>
      )}
    </div>
  );
};