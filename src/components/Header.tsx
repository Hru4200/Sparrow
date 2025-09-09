import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Moon, Sun, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onToggleTheme: () => void;
  theme: 'dark' | 'light';
}

export default function Header({ onToggleTheme, theme }: HeaderProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between transition-colors`}>
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} hover:opacity-80 transition-opacity cursor-pointer`}>
          <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Sparrow
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
          <Coins className="h-5 w-5 text-green-500" />
          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {user.credits} Credits
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition-colors`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className={`flex items-center space-x-3 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full">
            <User className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {user.name}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Pilot #{user.id.slice(0, 6)}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}