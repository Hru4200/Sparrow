import React from 'react';
import { Map, Settings, Zap, ChevronLeft, ChevronRight, MapPin, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeView: 'map' | 'drones' | 'requests' | 'silk-road' | 'blog';
  onViewChange: (view: 'map' | 'drones' | 'requests' | 'silk-road' | 'blog') => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
}

export default function Sidebar({ activeView, onViewChange, isOpen, onToggle, theme }: SidebarProps) {
  const location = useLocation();
  
  const menuItems = [
    { id: 'map', label: 'Map View', icon: Map, path: '/dashboard' },
    { id: 'drones', label: 'My Drones', icon: Settings, path: '/drones' },
    { id: 'requests', label: 'Recharge Requests', icon: Zap, path: '/recharge-requests' },
    { id: 'silk-road', label: 'Silk Road', icon: MapPin, path: '/silk-road' },
    { id: 'blog', label: 'Blog', icon: BookOpen, path: '/blog' }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${isOpen ? 'w-64' : 'w-16'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 z-10`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={onToggle}
            className={`w-full flex items-center justify-center p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            {isOpen ? (
              <ChevronLeft className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <ChevronRight className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center ${isOpen ? 'px-4 py-3' : 'px-2 py-3 justify-center'} rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-black'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5" />
                {isOpen && (
                  <span className="ml-3 font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}