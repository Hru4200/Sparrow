import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import DroneManager from './components/DroneManager';
import RechargeRequests from './components/RechargeRequests';
import SilkRoadPage from './components/SilkRoadPage';
import Blog from './components/Blog';
import WelcomeAnimation from './components/WelcomeAnimation';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, generateMockData } from './utils/storage';

function AppContent() {
  const { user, updateCredits } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const { toasts, removeToast, showSuccess } = useToast();

  useEffect(() => {
    // Load theme preference
    const storedTheme = loadFromStorage(STORAGE_KEYS.THEME, 'dark');
    setTheme(storedTheme);

    // Initialize mock data if needed
    const storedDrones = loadFromStorage(STORAGE_KEYS.DRONES, []);
    const storedStops = loadFromStorage(STORAGE_KEYS.RECHARGE_STOPS, []);

    if (storedDrones.length === 0 || storedStops.length === 0) {
      const mockData = generateMockData();
      saveToStorage(STORAGE_KEYS.DRONES, mockData.drones);
      saveToStorage(STORAGE_KEYS.RECHARGE_STOPS, mockData.rechargeStops);
    }
  }, []);

  useEffect(() => {
    // Check for first-time user and award welcome credits
    if (user && !user.welcomeCreditsAwarded) {
      setTimeout(() => {
        updateCredits(50);
        setShowWelcomeAnimation(true);
        
        // Update user to mark welcome credits as awarded
        const updatedUser = { ...user, welcomeCreditsAwarded: true };
        localStorage.setItem('sparrow_user', JSON.stringify(updatedUser));
        
        setTimeout(() => {
          showSuccess('Welcome to Sparrow!', 'You\'ve received 50 free credits to get started.');
        }, 3500);
      }, 1000);
    }
  }, [user, updateCredits, showSuccess]);

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveToStorage(STORAGE_KEYS.THEME, newTheme);
  };

  const handleUpdateRequest = (requestId: string, status: 'accepted' | 'completed' | 'rejected') => {
    const requests = loadFromStorage(STORAGE_KEYS.RECHARGE_REQUESTS, []);
    const updatedRequests = requests.map((request: any) => 
      request.id === requestId ? { ...request, status } : request
    );
    saveToStorage(STORAGE_KEYS.RECHARGE_REQUESTS, updatedRequests);
    
    if (status === 'completed') {
      const request = requests.find((r: any) => r.id === requestId);
      if (request && user) {
        updateCredits(-request.credits);
        showSuccess('Recharge Complete', `${request.credits} credits deducted from your account`);
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Header onToggleTheme={handleToggleTheme} theme={theme} />
              <div className="flex">
                <Sidebar
                  activeView="map"
                  onViewChange={() => {}}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                  theme={theme}
                />
                <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
                  <Dashboard theme={theme} />
                </main>
              </div>
            </PrivateRoute>
          } />
          
          <Route path="/drones" element={
            <PrivateRoute>
              <Header onToggleTheme={handleToggleTheme} theme={theme} />
              <div className="flex">
                <Sidebar
                  activeView="drones"
                  onViewChange={() => {}}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                  theme={theme}
                />
                <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
                  <DroneManager theme={theme} />
                </main>
              </div>
            </PrivateRoute>
          } />
          
          <Route path="/recharge-requests" element={
            <PrivateRoute>
              <Header onToggleTheme={handleToggleTheme} theme={theme} />
              <div className="flex">
                <Sidebar
                  activeView="requests"
                  onViewChange={() => {}}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                  theme={theme}
                />
                <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
                  <RechargeRequests onUpdateRequest={handleUpdateRequest} theme={theme} />
                </main>
              </div>
            </PrivateRoute>
          } />
          
          <Route path="/silk-road" element={
            <PrivateRoute>
              <Header onToggleTheme={handleToggleTheme} theme={theme} />
              <div className="flex">
                <Sidebar
                  activeView="silk-road"
                  onViewChange={() => {}}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                  theme={theme}
                />
                <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
                  <SilkRoadPage theme={theme} onShowToast={showSuccess} />
                </main>
              </div>
            </PrivateRoute>
          } />
          
          <Route path="/blog" element={
            <PrivateRoute>
              <Header onToggleTheme={handleToggleTheme} theme={theme} />
              <div className="flex">
                <Sidebar
                  activeView="blog"
                  onViewChange={() => {}}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                  theme={theme}
                />
                <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
                  <Blog theme={theme} />
                </main>
              </div>
            </PrivateRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={theme} />

      {/* Welcome Animation */}
      {showWelcomeAnimation && (
        <WelcomeAnimation
          credits={50}
          onComplete={() => setShowWelcomeAnimation(false)}
          theme={theme}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}