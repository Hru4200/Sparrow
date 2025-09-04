import React, { useState, useEffect } from 'react';
import { User, Drone, RechargeStop, RechargeRequest } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import MapView from './MapView';
import DroneManager from './DroneManager';
import RechargeRequests from './RechargeRequests';
import SilkRoadPage from './SilkRoadPage';
import CreditAnimation from './CreditAnimation';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, generateMockData } from '../utils/storage';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Dashboard({ user, onLogout, theme, onToggleTheme }: DashboardProps) {
  const [activeView, setActiveView] = useState<'map' | 'drones' | 'requests' | 'silk-road'>('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [rechargeStops, setRechargeStops] = useState<RechargeStop[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [showCreditAnimation, setShowCreditAnimation] = useState(false);
  const [creditAnimationAmount, setCreditAnimationAmount] = useState(0);

  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();

  useEffect(() => {
    // Load data from storage
    const storedDrones = loadFromStorage(STORAGE_KEYS.DRONES, []);
    const storedStops = loadFromStorage(STORAGE_KEYS.RECHARGE_STOPS, []);
    const storedRequests = loadFromStorage(STORAGE_KEYS.RECHARGE_REQUESTS, []);

    if (storedDrones.length === 0 || storedStops.length === 0) {
      // Generate initial mock data
      const mockData = generateMockData();
      setDrones(mockData.drones);
      setRechargeStops(mockData.rechargeStops);
      saveToStorage(STORAGE_KEYS.DRONES, mockData.drones);
      saveToStorage(STORAGE_KEYS.RECHARGE_STOPS, mockData.rechargeStops);
    } else {
      setDrones(storedDrones);
      setRechargeStops(storedStops);
    }

    setRechargeRequests(storedRequests);

    // Check for first-time login and award welcome credits
    const hasReceivedWelcomeCredits = loadFromStorage(STORAGE_KEYS.WELCOME_CREDITS_GRANTED, false);
    if (!hasReceivedWelcomeCredits) {
      setTimeout(() => {
        const updatedUser = { ...currentUser, credits: currentUser.credits + 50 };
        setCurrentUser(updatedUser);
        saveToStorage(STORAGE_KEYS.USER, updatedUser);
        saveToStorage(STORAGE_KEYS.WELCOME_CREDITS_GRANTED, true);
        
        setCreditAnimationAmount(50);
        setShowCreditAnimation(true);
        
        setTimeout(() => {
          showSuccess('Welcome to Sparrow!', 'You\'ve received 50 free credits to get started with the drone network.');
        }, 3000);
      }, 2000);
    }
  }, []);

  const handleAddDrone = (droneData: Omit<Drone, 'id' | 'ownerId'>) => {
    const newDrone: Drone = {
      ...droneData,
      id: `drone_${Date.now()}`,
      ownerId: currentUser.id
    };
    
    const updatedDrones = [...drones, newDrone];
    setDrones(updatedDrones);
    saveToStorage(STORAGE_KEYS.DRONES, updatedDrones);
  };

  const handleUpdateDrone = (droneId: string, updates: Partial<Drone>) => {
    const updatedDrones = drones.map(drone => 
      drone.id === droneId ? { ...drone, ...updates } : drone
    );
    setDrones(updatedDrones);
    saveToStorage(STORAGE_KEYS.DRONES, updatedDrones);
  };

  const handleDeleteDrone = (droneId: string) => {
    const updatedDrones = drones.filter(drone => drone.id !== droneId);
    setDrones(updatedDrones);
    saveToStorage(STORAGE_KEYS.DRONES, updatedDrones);
  };

  const handleCreateRechargeRequest = (droneId: string, stopId: string) => {
    const drone = drones.find(d => d.id === droneId);
    const stop = rechargeStops.find(s => s.id === stopId);
    
    if (!drone || !stop) return;

    const newRequest: RechargeRequest = {
      id: `request_${Date.now()}`,
      droneId,
      stopId,
      requesterId: currentUser.id,
      hostId: stop.hostId,
      status: 'pending',
      credits: stop.credits,
      createdAt: new Date(),
      estimatedDuration: 30 + Math.floor(Math.random() * 60) // 30-90 minutes
    };

    const updatedRequests = [...rechargeRequests, newRequest];
    setRechargeRequests(updatedRequests);
    saveToStorage(STORAGE_KEYS.RECHARGE_REQUESTS, updatedRequests);
    
    showSuccess('Request Sent', `Recharge request sent for ${drone.name} at ${stop.name}`);
  };

  const handleUpdateRequest = (requestId: string, status: 'accepted' | 'completed' | 'rejected') => {
    const updatedRequests = rechargeRequests.map(request => {
      if (request.id === requestId) {
        const updatedRequest = { ...request, status };
        
        // Handle credit transactions
        if (status === 'completed') {
          const updatedUser = { ...currentUser, credits: currentUser.credits - request.credits };
          setCurrentUser(updatedUser);
          saveToStorage(STORAGE_KEYS.USER, updatedUser);
          showSuccess('Recharge Complete', `${request.credits} credits deducted from your account`);
        }
        
        return updatedRequest;
      }
      return request;
    });
    
    setRechargeRequests(updatedRequests);
    saveToStorage(STORAGE_KEYS.RECHARGE_REQUESTS, updatedRequests);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'map':
        return (
          <MapView
            drones={drones}
            rechargeStops={rechargeStops}
            rechargeRequests={rechargeRequests}
            onCreateRechargeRequest={handleCreateRechargeRequest}
            theme={theme}
          />
        );
      case 'drones':
        return (
          <DroneManager
            drones={drones}
            onAddDrone={handleAddDrone}
            onUpdateDrone={handleUpdateDrone}
            onDeleteDrone={handleDeleteDrone}
            rechargeStops={rechargeStops}
            onShowToast={showSuccess}
            theme={theme}
          />
        );
      case 'requests':
        return (
          <RechargeRequests
            requests={rechargeRequests}
            drones={drones}
            rechargeStops={rechargeStops}
            onUpdateRequest={handleUpdateRequest}
            theme={theme}
          />
        );
      case 'silk-road':
        return (
          <SilkRoadPage
            user={currentUser}
            theme={theme}
            onShowToast={showSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`}>
      <Header 
        user={currentUser} 
        onLogout={onLogout} 
        onToggleTheme={onToggleTheme}
        theme={theme}
      />
      
      <div className="flex">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
        />
        
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
          {renderActiveView()}
        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={theme} />

      {/* Credit Animation */}
      {showCreditAnimation && (
        <CreditAnimation
          credits={creditAnimationAmount}
          onComplete={() => setShowCreditAnimation(false)}
          theme={theme}
        />
      )}
    </div>
  );
}