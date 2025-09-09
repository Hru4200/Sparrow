import React from 'react';
import { Map, Settings, Zap, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface SidebarProps {
  activeView: 'map' | 'drones' | 'requests' | 'silk-road';
  onViewChange: (view: 'map' | 'drones' | 'requests' | 'silk-road') => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
}

export default function Sidebar({ activeView, onViewChange, isOpen, onToggle, theme }: SidebarProps) {
  const menuItems = [
    { id: 'map', label: 'Map View', icon: Map },
    { id: 'drones', label: 'My Drones', icon: Settings },
    { id: 'requests', label: 'Recharge Requests', icon: Zap },
    { id: 'silk-road', label: 'Silk Road', icon: MapPin }
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
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as 'map' | 'drones' | 'requests' | 'silk-road')}
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
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}