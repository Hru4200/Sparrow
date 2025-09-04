import React, { useState } from 'react';
import { Drone } from '../types';
import { Plus, Edit3, Trash2, Battery, MapPin, Settings, Search, Filter } from 'lucide-react';
import SearchFilter from './SearchFilter';
import ConfirmDialog from './ConfirmDialog';

interface DroneManagerProps {
  drones: Drone[];
  onAddDrone: (drone: Omit<Drone, 'id' | 'ownerId'>) => void;
  onUpdateDrone: (droneId: string, updates: Partial<Drone>) => void;
  onDeleteDrone: (droneId: string) => void;
  theme: 'dark' | 'light';
}

export default function DroneManager({ 
  drones, 
  onAddDrone, 
  onUpdateDrone, 
  onDeleteDrone, 
  theme 
}: DroneManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', batteryLevel: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    batteryLevel: 100,
    status: 'active' as const,
    position: { lat: 37.7749, lng: -122.4194 }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      batteryLevel: 100,
      status: 'active',
      position: { lat: 37.7749, lng: -122.4194 }
    });
    setShowAddForm(false);
    setEditingDrone(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDrone) {
      onUpdateDrone(editingDrone.id, formData);
    } else {
      onAddDrone(formData);
    }
    
    resetForm();
  };

  const handleEdit = (drone: Drone) => {
    setFormData({
      name: drone.name,
      model: drone.model,
      batteryLevel: drone.batteryLevel,
      status: drone.status,
      position: drone.position
    });
    setEditingDrone(drone);
    setShowAddForm(true);
  };

  const handleDelete = (droneId: string) => {
    onDeleteDrone(droneId);
    setDeleteConfirm(null);
    onShowToast('success', 'Drone Deleted', 'The drone has been removed from your fleet.');
  };

  const handleSaveRoute = (waypoints: any[], chargingStops: string[]) => {
    if (routeBuilderDrone) {
      // In a real app, this would save the route to the drone
      onShowToast('success', 'Route Saved', `Route planned for ${routeBuilderDrone.name} with ${waypoints.length} waypoints.`);
      setRouteBuilderDrone(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'low_battery': return 'text-yellow-400';
      case 'charging': return 'text-blue-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 75) return 'text-green-400';
    if (level > 50) return 'text-yellow-400';
    if (level > 25) return 'text-orange-400';
    return 'text-red-400';
  };

  // Filter drones based on search and filters
  const filteredDrones = drones.filter(drone => {
    const matchesSearch = drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drone.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || drone.status === filters.status;
    
    const matchesBattery = !filters.batteryLevel || 
      (filters.batteryLevel === 'high' && drone.batteryLevel >= 80) ||
      (filters.batteryLevel === 'medium' && drone.batteryLevel >= 30 && drone.batteryLevel < 80) ||
      (filters.batteryLevel === 'low' && drone.batteryLevel < 30);
    
    return matchesSearch && matchesStatus && matchesBattery;
  });

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-[calc(100vh-4rem)]`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Drones</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your drone fleet and monitor their status
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-3 px-6 rounded-lg transition-all flex items-center group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Add Drone
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={setFilters}
            theme={theme}
          />
        </div>

        {/* Drone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredDrones.map((drone) => (
            <div
              key={drone.id}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border shadow-sm hover:shadow-lg transition-all group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    drone.status === 'active' ? 'bg-green-500' :
                    drone.status === 'low_battery' ? 'bg-yellow-500' :
                    drone.status === 'charging' ? 'bg-blue-500' : 'bg-red-500'
                  }`}>
                    <Settings className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{drone.name}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {drone.model}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setRouteBuilderDrone(drone)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    title="Plan route"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(drone)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    title="Edit drone"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(drone.id)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-red-900' : 'hover:bg-red-100'} text-red-400 transition-colors`}
                    title="Delete drone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                  <span className={`text-sm font-medium ${getStatusColor(drone.status)}`}>
                    {drone.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Battery:</span>
                  <div className="flex items-center space-x-2">
                    <Battery className={`h-4 w-4 ${getBatteryColor(drone.batteryLevel)}`} />
                    <span className={`text-sm font-medium ${getBatteryColor(drone.batteryLevel)}`}>
                      {drone.batteryLevel}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Max Range:</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {drone.maxRange} km
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Location:</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {drone.position.lat.toFixed(2)}, {drone.position.lng.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {drone.status === 'low_battery' && (
                <div className={`mt-4 p-3 ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'} border border-yellow-500/30 rounded-lg`}>
                  <p className={`text-xs ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    ⚠️ Battery critically low - recharge recommended
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDrones.length === 0 && (
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-12 border border-dashed text-center`}>
            <Settings className={`h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              {drones.length === 0 ? 'No drones registered' : 'No drones match your filters'}
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mb-4`}>
              {drones.length === 0 
                ? 'Add your first drone to start using the DroneNet community'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {drones.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium py-2 px-4 rounded-lg transition-all"
              >
                Add Your First Drone
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <h3 className="text-lg font-semibold mb-4">
                {editingDrone ? 'Edit Drone' : 'Add New Drone'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Drone Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., Falcon X1"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Model
                  </label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select a model</option>
                    <option value="DJI Mavic Pro">DJI Mavic Pro</option>
                    <option value="DJI Air 2S">DJI Air 2S</option>
                    <option value="DJI Mini 3">DJI Mini 3</option>
                    <option value="Autel EVO Lite+">Autel EVO Lite+</option>
                    <option value="Skydio 2+">Skydio 2+</option>
                    <option value="Parrot Anafi">Parrot Anafi</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Battery Level (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.batteryLevel}
                      onChange={(e) => setFormData({ ...formData, batteryLevel: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="low_battery">Low Battery</option>
                      <option value="charging">Charging</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.position.lat}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        position: { ...formData.position, lat: parseFloat(e.target.value) }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.position.lng}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        position: { ...formData.position, lng: parseFloat(e.target.value) }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                      theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium rounded-lg transition-all"
                  >
                    {editingDrone ? 'Update Drone' : 'Add Drone'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title="Delete Drone"
          message="Are you sure you want to delete this drone? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          theme={theme}
          type="danger"
        />

        {/* Route Builder */}
        {routeBuilderDrone && (
          <RouteBuilder
            drone={routeBuilderDrone}
            rechargeStops={rechargeStops}
            onSaveRoute={handleSaveRoute}
            onClose={() => setRouteBuilderDrone(null)}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}