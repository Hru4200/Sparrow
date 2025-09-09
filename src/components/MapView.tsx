import React, { useState, useEffect } from 'react';
import { Drone, RechargeStop } from '../types';
import { MapPin, Zap, Battery, Clock, Star, Navigation, AlertTriangle, Route } from 'lucide-react';
import { calculateDistance } from '../utils/routeCalculations';
import { useAuth } from '../contexts/AuthContext';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { useToast } from '../hooks/useToast';
import InteractiveMap from './InteractiveMap';

interface MapViewProps {
  theme: 'dark' | 'light';
}

export default function MapView({ theme }: MapViewProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [selectedStop, setSelectedStop] = useState<RechargeStop | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeExceedsRange, setRouteExceedsRange] = useState(false);

  // Load data from storage
  const drones = loadFromStorage(STORAGE_KEYS.DRONES, []);
  const rechargeStops = loadFromStorage(STORAGE_KEYS.RECHARGE_STOPS, []);
  const rechargeRequests = loadFromStorage(STORAGE_KEYS.RECHARGE_REQUESTS, []);

  if (!user) {
    return (
      <div className={`h-[calc(100vh-4rem)] ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Please log in</h3>
          <p className="text-gray-500">You need to be logged in to view the map.</p>
        </div>
      </div>
    );
  }

  const onCreateRechargeRequest = (droneId: string, stopId: string) => {
    const drone = drones.find((d: Drone) => d.id === droneId);
    const stop = rechargeStops.find((s: RechargeStop) => s.id === stopId);
    
    if (!drone || !stop) return;

    const newRequest = {
      id: `request_${Date.now()}`,
      droneId,
      stopId,
      requesterId: user.id,
      hostId: stop.hostId,
      status: 'pending',
      credits: stop.credits,
      createdAt: new Date(),
      estimatedDuration: 30 + Math.floor(Math.random() * 60)
    };

    const updatedRequests = [...rechargeRequests, newRequest];
    saveToStorage(STORAGE_KEYS.RECHARGE_REQUESTS, updatedRequests);
    
    showSuccess('Request Sent', `Recharge request sent for ${drone.name} at ${stop.name}`);
  };

  // Calculate route distance when both drone and stop are selected
  useEffect(() => {
    if (selectedDrone && selectedStop) {
      const distance = calculateDistance(selectedDrone.position, selectedStop.position);
      setRouteDistance(distance);
      setRouteExceedsRange(distance > selectedDrone.maxRange);
    } else {
      setRouteDistance(null);
      setRouteExceedsRange(false);
    }
  }, [selectedDrone, selectedStop]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'low_battery': return 'text-yellow-400';
      case 'charging': return 'text-blue-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level > 75) return '🔋';
    if (level > 50) return '🔋';
    if (level > 25) return '🪫';
    return '🪫';
  };

  const handleRequestRecharge = (droneId: string, stopId: string) => {
    if (routeExceedsRange) {
      return; // Prevent request if route exceeds range
    }
    onCreateRechargeRequest(droneId, stopId);
    setSelectedDrone(null);
    setSelectedStop(null);
  };

  const getActiveRequests = (droneId?: string, stopId?: string) => {
    return rechargeRequests.filter(req => 
      req.status === 'pending' && 
      (!droneId || req.droneId === droneId) &&
      (!stopId || req.stopId === stopId)
    );
  };

  return (
    <div className={`h-[calc(100vh-4rem)] ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} relative overflow-hidden`}>
      {/* Interactive Map */}
      <div className="absolute inset-0">
        <InteractiveMap
          center={[37.7749, -122.4194]}
          zoom={10}
          markers={[
            ...drones.map((drone: Drone) => ({
              id: drone.id,
              position: [drone.position.lat, drone.position.lng] as [number, number],
              type: 'drone' as const,
              title: drone.name,
              description: `${drone.model} - Battery: ${drone.batteryLevel}%`,
              onClick: () => setSelectedDrone(selectedDrone?.id === drone.id ? null : drone)
            })),
            ...rechargeStops.map((stop: RechargeStop) => ({
              id: stop.id,
              position: [stop.position.lat, stop.position.lng] as [number, number],
              type: 'station' as const,
              title: stop.name,
              description: `Host: ${stop.hostName} - ${stop.credits} credits`,
              onClick: () => setSelectedStop(selectedStop?.id === stop.id ? null : stop)
            }))
          ]}
          routes={selectedDrone && selectedStop ? [{
            positions: [
              [selectedDrone.position.lat, selectedDrone.position.lng],
              [selectedStop.position.lat, selectedStop.position.lng]
            ] as [number, number][],
            color: routeExceedsRange ? 'red' : '#10B981'
          }] : []}
          className="h-full w-full"
        />
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-3 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Navigation className="h-4 w-4 text-green-500" />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Map Controls
            </span>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Show Routes
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Route Distance Panel */}
      {routeDistance !== null && selectedDrone && selectedStop && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border ${
            routeExceedsRange ? 'border-red-500' : 'border-green-500'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Route className={`h-5 w-5 ${routeExceedsRange ? 'text-red-400' : 'text-green-400'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Route Planning
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Distance:</span>
                <span className={`font-medium ${routeExceedsRange ? 'text-red-400' : 'text-green-400'}`}>
                  {routeDistance.toFixed(2)} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Max Range:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {selectedDrone.maxRange} km
                </span>
              </div>
              {routeExceedsRange && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-500 rounded text-red-300 text-xs">
                  ⚠️ Route exceeds drone's maximum range!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className={`w-full h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} relative`}>
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" className="text-green-500">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Route Line */}
        {showRoutes && selectedDrone && selectedStop && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="30%"
              y1="40%"
              x2="60%"
              y2="30%"
              stroke={routeExceedsRange ? "#EF4444" : "#10B981"}
              strokeWidth="3"
              strokeDasharray="8,4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Drone Markers */}
        {drones.map((drone, index) => (
          <div
            key={drone.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${30 + index * 15}%`,
              top: `${40 + index * 10}%`
            }}
            onClick={() => setSelectedDrone(selectedDrone?.id === drone.id ? null : drone)}
          >
            {/* Drone Marker */}
            <div className={`relative p-3 rounded-full shadow-lg transition-all group-hover:scale-110 ${
              selectedDrone?.id === drone.id ? 'ring-4 ring-green-400 ring-opacity-50' : ''
            } ${
              drone.status === 'active' ? 'bg-green-500' :
              drone.status === 'low_battery' ? 'bg-yellow-500' :
              drone.status === 'charging' ? 'bg-blue-500' : 'bg-red-500'
            }`}>
              <Zap className="h-6 w-6 text-black" />
              
              {/* Battery Indicator */}
              <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-1 py-0.5 rounded">
                {drone.batteryLevel}%
              </div>
            </div>

            {/* Drone Info Popup */}
            {selectedDrone?.id === drone.id && (
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border p-4 z-20`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {drone.name}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(drone.status)} bg-opacity-20`}>
                      {drone.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Model:</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{drone.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Battery:</span>
                      <span className={getStatusColor(drone.status)}>
                        {getBatteryIcon(drone.batteryLevel)} {drone.batteryLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Max Range:</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {drone.maxRange} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Location:</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {drone.position.lat.toFixed(4)}, {drone.position.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {drone.status === 'low_battery' && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className={`text-xs ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'} mb-2`}>
                        ⚠️ Low battery - find a charging station
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Recharge Stop Markers */}
        {rechargeStops.map((stop, index) => (
          <div
            key={stop.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${60 + index * 20}%`,
              top: `${30 + index * 15}%`
            }}
            onClick={() => setSelectedStop(selectedStop?.id === stop.id ? null : stop)}
          >
            {/* Stop Marker */}
            <div className={`relative p-3 rounded-full shadow-lg transition-all group-hover:scale-110 ${
              selectedStop?.id === stop.id ? 'ring-4 ring-green-400 ring-opacity-50' : ''
            } ${
              stop.available ? 'bg-green-400' : 'bg-gray-500'
            }`}>
              <MapPin className="h-6 w-6 text-black" />
              
              {/* Availability Indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                stop.available ? 'bg-green-300' : 'bg-red-500'
              } border-2 border-black`} />
            </div>

            {/* Stop Info Popup */}
            {selectedStop?.id === stop.id && (
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border p-4 z-20`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stop.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {stop.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Host:</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{stop.hostName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Cost:</span>
                      <span className="text-green-400 font-medium">{stop.credits} credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                      <span className={stop.available ? 'text-green-400' : 'text-red-400'}>
                        {stop.available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    {routeDistance !== null && (
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Distance:</span>
                        <span className={routeExceedsRange ? 'text-red-400' : 'text-green-400'}>
                          {routeDistance.toFixed(2)} km
                        </span>
                      </div>
                    )}
                  </div>

                  {stop.available && selectedDrone && (
                    <div className="pt-3 border-t border-gray-700">
                      {routeExceedsRange ? (
                        <div className="bg-red-900/30 border border-red-500 text-red-300 px-3 py-2 rounded-lg text-sm">
                          ⚠️ Route exceeds {selectedDrone.name}'s max range of {selectedDrone.maxRange} km
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestRecharge(selectedDrone.id, stop.id)}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                        >
                          Request Recharge
                          <Zap className="ml-2 h-4 w-4" />
                        </button>
                      )}
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1 text-center`}>
                        {selectedDrone ? `Selected: ${selectedDrone.name}` : 'Select a drone first'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Map Legend
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Active Drone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Low Battery</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Charging</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Available Stop</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Busy Stop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Network Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Active Drones:</span>
                <span className="text-green-400 font-medium">
                  {drones.filter(d => d.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Available Stops:</span>
                <span className="text-green-400 font-medium">
                  {rechargeStops.filter(s => s.available).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Pending Requests:</span>
                <span className="text-yellow-400 font-medium">
                  {rechargeRequests.filter(r => r.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!selectedDrone && !selectedStop && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} max-w-xs`}>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    How to Request Recharge
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    1. Click on a drone to select it<br/>
                    2. Click on an available charging station<br/>
                    3. Check the route distance and confirm
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}