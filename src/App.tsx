import React, { useState, useEffect } from 'react';
import { useToast } from './hooks/useToast';
import { User } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Blog from './components/Blog';
import SilkRoadPage from './components/SilkRoadPage';
import RechargeRequests from './components/RechargeRequests';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './utils/storage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Load user from storage
    const storedUser = loadFromStorage(STORAGE_KEYS.USER, null);
    if (storedUser) {
      setUser(storedUser);
    }

    // Load theme preference
    const storedTheme = loadFromStorage(STORAGE_KEYS.THEME, 'dark');
    setTheme(storedTheme);
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Mock user creation - in real app, this would authenticate with backend
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email,
      credits: 0 // Will be awarded 50 welcome credits in Dashboard
    };
    
    setUser(newUser);
    saveToStorage(STORAGE_KEYS.USER, newUser);
  };

  const handleRegister = (email: string, password: string, name: string) => {
    // Mock user creation
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      credits: 0 // Will be awarded 50 welcome credits in Dashboard
    };
    
    setUser(newUser);
    saveToStorage(STORAGE_KEYS.USER, newUser);
  };

  const handleLogout = () => {
    setUser(null);
    // Clear user data but keep other app data
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.WELCOME_CREDITS_GRANTED);
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
            <Route path="/blog" element={<Blog />} />
    saveToStorage(STORAGE_KEYS.THEME, newTheme);
  };
  const { toasts, removeToast } = useToast();

  if (!user) {
            <Route path="/silk-road" element={
              <PrivateRoute>
                <SilkRoadPage />
              </PrivateRoute>
            } />
            <Route path="/recharge-requests" element={
              <PrivateRoute>
                <RechargeRequests />
              </PrivateRoute>
            } />
    return (
      <LandingPage 
          <ToastContainer toasts={toasts} onRemove={removeToast} theme="dark" />
        onRegister={handleRegister} 
      />
    );
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    />
  );
}