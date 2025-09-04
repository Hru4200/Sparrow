import React, { useState, useEffect } from 'react';
import { Drone, RechargeStop, RechargeRequest } from '../types';
import { MapPin, Zap, Battery, Clock, Star, Navigation, AlertTriangle } from 'lucide-react';

interface MapViewProps {
  drones: Drone[];
  rechargeStops: RechargeStop[];
  rechargeRequests: RechargeRequest[];
  onCreateRechargeRequest: (droneId: string, stopId: string) => void;
  theme: 'dark' | 'light';
}

export default function MapView({ 
  drones, 
  rechargeStops, 
  rechargeRequests, 
  onCreateRechargeRequest, 
  theme 
}: MapViewProps) {
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [selectedStop, setSelectedStop] = useState<RechargeStop | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [zoom, setZoom] = useState(12);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would update drone positions in a real app
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
            {/* Route Line */}
            {showRoutes && getActiveRequests(drone.id).length > 0 && (
              <svg className="absolute -z-10" width="200" height="100">
                <line
                  x1="0"
                  y1="0"
                  x2="150"
                  y2="80"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Drone Marker */}
            <div className={`relative p-3 rounded-full shadow-lg transition-all group-hover:scale-110 ${
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
                        {stop.rating}
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
                  </div>

                  {stop.available && selectedDrone && (
                    <div className="pt-3 border-t border-gray-700">
                      <button
                        onClick={() => handleRequestRecharge(selectedDrone.id, stop.id)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                      >
                        Request Recharge
                        <Zap className="ml-2 h-4 w-4" />
                      </button>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1 text-center`}>
                        Select a drone first to request recharge
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
                    3. Confirm your recharge request
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