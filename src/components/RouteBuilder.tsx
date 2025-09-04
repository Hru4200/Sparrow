import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Navigation, AlertTriangle, CheckCircle, Route as RouteIcon } from 'lucide-react';
import { RoutePoint, calculateDistance, calculateRouteDistance, validateRoute, findOptimalChargingStations } from '../utils/routeCalculations';
import { Drone, RechargeStop } from '../types';

interface RouteBuilderProps {
  drone: Drone;
  rechargeStops: RechargeStop[];
  onSaveRoute: (waypoints: RoutePoint[], chargingStops: string[]) => void;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export default function RouteBuilder({ drone, rechargeStops, onSaveRoute, onClose, theme }: RouteBuilderProps) {
  const [waypoints, setWaypoints] = useState<RoutePoint[]>([
    { lat: drone.position.lat, lng: drone.position.lng, type: 'start' }
  ]);
  const [selectedChargingStops, setSelectedChargingStops] = useState<string[]>([]);
  const [routeValidation, setRouteValidation] = useState<{ isValid: boolean; issues: string[] }>({ isValid: true, issues: [] });

  useEffect(() => {
    if (waypoints.length >= 2) {
      const validation = validateRoute(waypoints, drone.maxRange, drone.batteryLevel, drone.model);
      setRouteValidation(validation);
      
      // Auto-suggest charging stations if route is too long
      if (!validation.isValid && validation.issues.some(issue => issue.includes('maximum range'))) {
        const suggestedStations = findOptimalChargingStations(waypoints, rechargeStops, drone.maxRange);
        setSelectedChargingStops(suggestedStations);
      }
    }
  }, [waypoints, drone.maxRange, drone.batteryLevel, drone.model, rechargeStops]);

  const addWaypoint = () => {
    const lastPoint = waypoints[waypoints.length - 1];
    const newPoint: RoutePoint = {
      lat: lastPoint.lat + 0.01,
      lng: lastPoint.lng + 0.01,
      type: 'waypoint'
    };
    setWaypoints([...waypoints, newPoint]);
  };

  const updateWaypoint = (index: number, lat: number, lng: number) => {
    const updated = [...waypoints];
    updated[index] = { ...updated[index], lat, lng };
    setWaypoints(updated);
  };

  const removeWaypoint = (index: number) => {
    if (waypoints.length > 1 && index > 0) {
      setWaypoints(waypoints.filter((_, i) => i !== index));
    }
  };

  const toggleChargingStop = (stopId: string) => {
    setSelectedChargingStops(prev => 
      prev.includes(stopId) 
        ? prev.filter(id => id !== stopId)
        : [...prev, stopId]
    );
  };

  const handleSave = () => {
    if (routeValidation.isValid) {
      onSaveRoute(waypoints, selectedChargingStops);
      onClose();
    }
  };

  const totalDistance = calculateRouteDistance(waypoints);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RouteIcon className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="text-xl font-semibold">Route Builder</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Plan route for {drone.name} (Max range: {drone.maxRange} km)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Route Planning Panel */}
          <div className="w-1/2 p-6 border-r border-gray-700 overflow-y-auto">
            <div className="space-y-6">
              {/* Route Stats */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className="font-medium mb-3">Route Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Distance:</span>
                    <span className="font-medium">{totalDistance.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Waypoints:</span>
                    <span className="font-medium">{waypoints.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Charging Stops:</span>
                    <span className="font-medium">{selectedChargingStops.length}</span>
                  </div>
                </div>
              </div>

              {/* Route Validation */}
              {!routeValidation.isValid && (
                <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <h4 className="font-medium text-red-400">Route Issues</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-red-300">
                    {routeValidation.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Waypoints */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Waypoints</h4>
                  <button
                    onClick={addWaypoint}
                    className="flex items-center space-x-1 text-green-400 hover:text-green-300 text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Waypoint</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {waypoints.map((point, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {point.type === 'start' ? 'Start Point' : `Waypoint ${index}`}
                        </span>
                        {index > 0 && (
                          <button
                            onClick={() => removeWaypoint(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            value={point.lat}
                            onChange={(e) => updateWaypoint(index, parseFloat(e.target.value), point.lng)}
                            className={`w-full px-2 py-1 text-sm border rounded ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            disabled={point.type === 'start'}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            value={point.lng}
                            onChange={(e) => updateWaypoint(index, point.lat, parseFloat(e.target.value))}
                            className={`w-full px-2 py-1 text-sm border rounded ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            disabled={point.type === 'start'}
                          />
                        </div>
                      </div>
                      
                      {index > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          Distance from previous: {calculateDistance(waypoints[index - 1], point).toFixed(1)} km
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Charging Stations */}
              <div>
                <h4 className="font-medium mb-3">Available Charging Stations</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rechargeStops.filter(stop => stop.available).map((stop) => (
                    <div
                      key={stop.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedChargingStops.includes(stop.id)
                          ? 'border-green-500 bg-green-500/10'
                          : theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleChargingStop(stop.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{stop.name}</h5>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Host: {stop.hostName} • {stop.credits} credits
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedChargingStops.includes(stop.id) && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="w-1/2 p-6">
            <div className={`h-full rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20">
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" className="text-green-500">
                    <defs>
                      <pattern id="route-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#route-grid)" />
                  </svg>
                </div>
              </div>

              {/* Route Visualization */}
              <svg className="absolute inset-0 w-full h-full">
                {waypoints.length > 1 && waypoints.map((point, index) => {
                  if (index === 0) return null;
                  const prevPoint = waypoints[index - 1];
                  return (
                    <line
                      key={index}
                      x1={`${(prevPoint.lng + 122.4194) * 1000}%`}
                      y1={`${(37.7749 - prevPoint.lat) * 1000}%`}
                      x2={`${(point.lng + 122.4194) * 1000}%`}
                      y2={`${(37.7749 - point.lat) * 1000}%`}
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  );
                })}
              </svg>

              {/* Waypoint Markers */}
              {waypoints.map((point, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${50 + index * 15}%`,
                    top: `${30 + index * 10}%`
                  }}
                >
                  <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                    point.type === 'start' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    <div className="w-full h-full rounded-full bg-current opacity-80" />
                  </div>
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  } shadow-lg`}>
                    {point.type === 'start' ? 'Start' : `W${index}`}
                  </div>
                </div>
              ))}

              {/* Charging Station Markers */}
              {selectedChargingStops.map((stopId, index) => {
                const stop = rechargeStops.find(s => s.id === stopId);
                if (!stop) return null;
                
                return (
                  <div
                    key={stopId}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${70 + index * 10}%`,
                      top: `${50 + index * 15}%`
                    }}
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-black" />
                    </div>
                    <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium px-2 py-1 rounded ${
                      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } shadow-lg whitespace-nowrap`}>
                      {stop.name}
                    </div>
                  </div>
                );
              })}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-3 text-xs`}>
                  <h5 className="font-medium mb-2">Legend</h5>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Start Point</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Waypoint</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Charging Stop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              routeValidation.isValid ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}>
              {routeValidation.isValid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {routeValidation.isValid ? 'Route Valid' : 'Route Issues'}
              </span>
            </div>
            
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total: {totalDistance.toFixed(1)} km / {drone.maxRange} km
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!routeValidation.isValid}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-all"
            >
              Save Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}