import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { Clock, CheckCircle, XCircle, AlertCircle, Battery, MapPin, User, Coins, Send, Plus } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface RechargeRequest {
  id: string;
  droneId: string;
  droneName: string;
  stationId: string;
  stationName: string;
  requesterId: string;
  requesterName: string;
  hostId: string;
  hostName: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  credits: number;
  createdAt: Date;
  estimatedDuration: number;
  kmNeeded: number;
  batteryLevel: number;
}

interface Drone {
  id: string;
  name: string;
  batteryLevel: number;
  maxRange: number;
}

interface Station {
  id: string;
  name: string;
  hostName: string;
  credits: number;
  available: boolean;
}

export default function RechargeRequests() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<RechargeRequest[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    droneId: '',
    stationId: '',
    kmNeeded: 0,
    estimatedDuration: 30
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data for demo - replace with Supabase queries
      const mockDrones: Drone[] = [
        { id: '1', name: 'Falcon X1', batteryLevel: 25, maxRange: 50 },
        { id: '2', name: 'Eagle Pro', batteryLevel: 60, maxRange: 75 },
        { id: '3', name: 'Swift Mini', batteryLevel: 15, maxRange: 30 }
      ];

      const mockStations: Station[] = [
        { id: '1', name: 'Athens Hub', hostName: 'Alex Chen', credits: 15, available: true },
        { id: '2', name: 'Belgrade Station', hostName: 'Maria Rodriguez', credits: 12, available: true },
        { id: '3', name: 'Milan Charging Point', hostName: 'John Smith', credits: 18, available: false }
      ];

      const mockRequests: RechargeRequest[] = [
        {
          id: '1',
          droneId: '1',
          droneName: 'Falcon X1',
          stationId: '1',
          stationName: 'Athens Hub',
          requesterId: user?.id || 'user1',
          requesterName: user?.name || 'Demo User',
          hostId: 'host1',
          hostName: 'Alex Chen',
          status: 'pending',
          credits: 15,
          createdAt: new Date('2024-01-15T10:30:00'),
          estimatedDuration: 45,
          kmNeeded: 25,
          batteryLevel: 25
        },
        {
          id: '2',
          droneId: '2',
          droneName: 'Eagle Pro',
          stationId: '2',
          stationName: 'Belgrade Station',
          requesterId: user?.id || 'user1',
          requesterName: user?.name || 'Demo User',
          hostId: 'host2',
          hostName: 'Maria Rodriguez',
          status: 'accepted',
          credits: 12,
          createdAt: new Date('2024-01-14T14:20:00'),
          estimatedDuration: 60,
          kmNeeded: 40,
          batteryLevel: 60
        },
        {
          id: '3',
          droneId: '3',
          droneName: 'Swift Mini',
          stationId: '1',
          stationName: 'Athens Hub',
          requesterId: user?.id || 'user1',
          requesterName: user?.name || 'Demo User',
          hostId: 'host1',
          hostName: 'Alex Chen',
          status: 'completed',
          credits: 15,
          createdAt: new Date('2024-01-12T09:15:00'),
          estimatedDuration: 30,
          kmNeeded: 15,
          batteryLevel: 15
        }
      ];

      setDrones(mockDrones);
      setStations(mockStations);
      setRequests(mockRequests);
    } catch (error) {
      showError('Error', 'Failed to load recharge requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError('Error', 'Please log in to create requests');
      return;
    }

    const selectedDrone = drones.find(d => d.id === formData.droneId);
    const selectedStation = stations.find(s => s.id === formData.stationId);
    
    if (!selectedDrone || !selectedStation) {
      showError('Error', 'Please select both drone and station');
      return;
    }

    try {
      const newRequest: RechargeRequest = {
        id: Date.now().toString(),
        droneId: formData.droneId,
        droneName: selectedDrone.name,
        stationId: formData.stationId,
        stationName: selectedStation.name,
        requesterId: user.id,
        requesterName: user.name,
        hostId: 'host1',
        hostName: selectedStation.hostName,
        status: 'pending',
        credits: selectedStation.credits,
        createdAt: new Date(),
        estimatedDuration: formData.estimatedDuration,
        kmNeeded: formData.kmNeeded,
        batteryLevel: selectedDrone.batteryLevel
      };

      setRequests([newRequest, ...requests]);
      setShowCreateForm(false);
      setFormData({ droneId: '', stationId: '', kmNeeded: 0, estimatedDuration: 30 });
      
      showSuccess('Request Created', `Recharge request sent for ${selectedDrone.name} at ${selectedStation.name}`);
    } catch (error) {
      showError('Error', 'Failed to create request');
    }
  };

  const handleUpdateRequest = (requestId: string, status: 'accepted' | 'completed' | 'rejected') => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        const updatedRequest = { ...request, status };
        
        if (status === 'completed') {
          showSuccess('Recharge Complete', `${request.credits} credits deducted from your account`);
        } else if (status === 'accepted') {
          showSuccess('Request Accepted', `Your request has been accepted by ${request.hostName}`);
        } else if (status === 'rejected') {
          showSuccess('Request Cancelled', 'Your recharge request has been cancelled');
        }
        
        return updatedRequest;
      }
      return request;
    });
    
    setRequests(updatedRequests);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner size="lg" text="Loading recharge requests..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Recharge Requests</h1>
              <p className="text-gray-400">
                Manage your drone charging requests and track their status
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-2 px-4 rounded-lg transition-all flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Request
            </button>
          </div>
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
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {status} ({requests.filter(r => status === 'all' || r.status === status).length})
            </button>
          ))}
        </div>

        {/* Create Request Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Create Recharge Request</h3>
              
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Select Drone
                  </label>
                  <select
                    value={formData.droneId}
                    onChange={(e) => setFormData({ ...formData, droneId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Choose a drone</option>
                    {drones.map((drone) => (
                      <option key={drone.id} value={drone.id}>
                        {drone.name} (Battery: {drone.batteryLevel}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Select Station
                  </label>
                  <select
                    value={formData.stationId}
                    onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Choose a station</option>
                    {stations.filter(s => s.available).map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name} ({station.credits} credits)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      KM Needed
                    </label>
                    <input
                      type="number"
                      value={formData.kmNeeded}
                      onChange={(e) => setFormData({ ...formData, kmNeeded: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="15"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium rounded-lg transition-all flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Create Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-800 border-gray-700 rounded-lg p-6 border shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Battery className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{request.droneName}</h3>
                    <p className="text-sm text-gray-400">
                      Battery: {request.batteryLevel}% • Range needed: {request.kmNeeded} km
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
                    <span className="text-sm text-gray-400">Charging Station:</span>
                    <span className="font-medium">{request.stationName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Host:</span>
                    <span className="font-medium">{request.hostName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Cost:</span>
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-green-400">{request.credits} credits</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Estimated Duration:</span>
                    <span className="font-medium">{request.estimatedDuration} min</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wide">Timing</h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Requested:</span>
                    <span className="font-medium">
                      {request.createdAt.toLocaleDateString()} at {request.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Requester:</span>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{request.requesterName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {request.status === 'pending' && (
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleUpdateRequest(request.id, 'rejected')}
                    className="px-4 py-2 border border-red-600 text-red-400 rounded-lg hover:bg-red-900/30 transition-all"
                  >
                    Cancel Request
                  </button>
                </div>
              )}

              {request.status === 'accepted' && (
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                  <div className="px-4 py-2 rounded-lg bg-blue-900/30 text-blue-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Charging in progress...</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateRequest(request.id, 'completed')}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium rounded-lg transition-all"
                  >
                    Mark Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="bg-gray-800 border-gray-700 rounded-lg p-12 border border-dashed text-center">
            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {requests.length === 0 ? 'No recharge requests yet' : `No ${filter} requests`}
            </h3>
            <p className="text-gray-500 mb-4">
              {requests.length === 0 
                ? 'Create your first recharge request to get started'
                : `Try selecting a different filter to view other requests`
              }
            </p>
            {requests.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium py-2 px-4 rounded-lg transition-all"
              >
                Create First Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}