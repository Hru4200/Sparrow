import React, { useState } from 'react';
import { RechargeRequest, Drone, RechargeStop } from '../types';
import { Clock, CheckCircle, XCircle, AlertCircle, Battery, MapPin, User, Coins } from 'lucide-react';

interface RechargeRequestsProps {
  requests: RechargeRequest[];
  drones: Drone[];
  rechargeStops: RechargeStop[];
  onUpdateRequest: (requestId: string, status: 'accepted' | 'completed' | 'rejected') => void;
  theme: 'dark' | 'light';
}

export default function RechargeRequests({ 
  requests, 
  drones, 
  rechargeStops, 
  onUpdateRequest, 
  theme 
}: RechargeRequestsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'accepted': return <CheckCircle className="h-5 w-5 text-blue-400" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'accepted': return 'text-blue-400 bg-blue-900/30';
      case 'completed': return 'text-green-400 bg-green-900/30';
      case 'rejected': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const getDroneInfo = (droneId: string) => {
    return drones.find(drone => drone.id === droneId);
  };

  const getStopInfo = (stopId: string) => {
    return rechargeStops.find(stop => stop.id === stopId);
  };

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-[calc(100vh-4rem)]`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Recharge Requests</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your drone charging requests and track their status
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6">
          {(['all', 'pending', 'accepted', 'completed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === status
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-black'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {status} ({requests.filter(r => status === 'all' || r.status === status).length})
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const drone = getDroneInfo(request.droneId);
            const stop = getStopInfo(request.stopId);
            
            if (!drone || !stop) return null;

            return (
              <div
                key={request.id}
                className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border shadow-sm hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      drone.status === 'active' ? 'bg-green-500' :
                      drone.status === 'low_battery' ? 'bg-yellow-500' :
                      drone.status === 'charging' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      <Battery className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{drone.name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {drone.model} • Battery: {drone.batteryLevel}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-2 capitalize">{request.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wide">Request Details</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Charging Station:</span>
                      <span className="font-medium">{stop.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Host:</span>
                      <span className="font-medium">{stop.hostName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cost:</span>
                      <div className="flex items-center space-x-1">
                        <Coins className="h-4 w-4 text-green-400" />
                        <span className="font-medium text-green-400">{request.credits} credits</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Duration:</span>
                      <span className="font-medium">{request.estimatedDuration} min</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wide">Location & Timing</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Location:</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono">
                          {stop.position.lat.toFixed(4)}, {stop.position.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Requested:</span>
                      <span className="font-medium">
                        {request.createdAt.toLocaleDateString()} at {request.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Station Rating:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="font-medium">{stop.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => onUpdateRequest(request.id, 'rejected')}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                        theme === 'dark'
                          ? 'border-red-600 text-red-400 hover:bg-red-900/30'
                          : 'border-red-500 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      Cancel Request
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                    <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'} text-blue-400`}>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Charging in progress...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onUpdateRequest(request.id, 'completed')}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium rounded-lg transition-all"
                    >
                      Mark Complete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-12 border border-dashed text-center`}>
            <AlertCircle className={`h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              {requests.length === 0 ? 'No recharge requests yet' : `No ${filter} requests`}
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mb-4`}>
              {requests.length === 0 
                ? 'Visit the map to request charging for your drones'
                : `Try selecting a different filter to view other requests`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}