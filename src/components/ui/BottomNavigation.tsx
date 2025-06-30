import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, BookOpen, ShoppingCart, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/dashboard',
  },
  {
    id: 'meals',
    label: 'Meals',
    icon: Calendar,
    path: '/meal-planning',
  },
  {
    id: 'recipes',
    label: 'Recipes',
    icon: BookOpen,
    path: '/recipes',
  },
  {
    id: 'grocery',
    label: 'Shopping',
    icon: ShoppingCart,
    path: '/grocery',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/settings',
  },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-all duration-200 ${
                active
                  ? 'text-secondary-500 bg-secondary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
              aria-label={item.label}
            >
              <Icon 
                size={20} 
                className={`mb-1 ${active ? 'text-secondary-500' : 'text-current'}`} 
              />
              <span className={`text-xs font-medium ${active ? 'text-secondary-500' : 'text-current'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};