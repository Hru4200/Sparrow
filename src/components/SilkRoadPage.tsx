import React, { useState, useEffect } from 'react';
import { MapPin, Plus, ThumbsUp, ThumbsDown, Filter, Search, Star, Clock, User } from 'lucide-react';
import { ProposedStation } from '../types';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

interface SilkRoadPageProps {
  theme: 'dark' | 'light';
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export default function SilkRoadPage({ theme, onShowToast }: SilkRoadPageProps) {
  const { user } = useAuth();
  const [proposedStations, setProposedStations] = useState<ProposedStation[]>([]);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  if (!user) {
    return (
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-[calc(100vh-4rem)]`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Please log in</h3>
            <p className="text-gray-500">You need to be logged in to access the Silk Road.</p>
          </div>
        </div>
      </div>
    );
  }
  useEffect(() => {
    const stored = loadFromStorage(STORAGE_KEYS.PROPOSED_STATIONS, []);
    setProposedStations(stored);
  }, []);

  const saveProposedStations = (stations: ProposedStation[]) => {
    setProposedStations(stations);
    saveToStorage(STORAGE_KEYS.PROPOSED_STATIONS, stations);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setShowProposalForm(true);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPosition) return;

    const newProposal: ProposedStation = {
      id: `proposal_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      position: selectedPosition,
      description: formData.description,
      priority: formData.priority,
      notes: formData.notes,
      submissionDate: new Date(),
      votes: 0,
      status: 'pending'
    };

    saveProposedStations([...proposedStations, newProposal]);
    
    setShowProposalForm(false);
    setSelectedPosition(null);
    setFormData({ description: '', priority: 'medium', notes: '' });
    
    onShowToast('success', 'Proposal Submitted', 'Your recharge station proposal has been submitted for community review.');
  };

  const handleVote = (proposalId: string, isUpvote: boolean) => {
    const updated = proposedStations.map(proposal => {
      if (proposal.id === proposalId) {
        return {
          ...proposal,
          votes: proposal.votes + (isUpvote ? 1 : -1)
        };
      }
      return proposal;
    });
    
    saveProposedStations(updated);
    onShowToast('info', 'Vote Recorded', `Your ${isUpvote ? 'upvote' : 'downvote'} has been recorded.`);
  };

  const filteredProposals = proposedStations.filter(proposal => {
    const matchesSearch = proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !priorityFilter || proposal.priority === priorityFilter;
    const matchesStatus = !statusFilter || proposal.status === statusFilter;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/30';
      case 'rejected': return 'text-red-400 bg-red-900/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-[calc(100vh-4rem)]`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-full">
              <MapPin className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Silk Road</h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Propose new recharge station locations to expand our global network
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'} border border-blue-500/30`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              💡 <strong>Inspired by the historic Silk Road:</strong> Help us build a connected network of charging stations 
              that enables drone pilots to fly anywhere in the world. Click on the map to propose strategic locations!
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Interactive Proposal Map</h2>
                <button
                  onClick={() => setShowProposalForm(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium py-2 px-4 rounded-lg transition-all flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Propose Location
                </button>
              </div>

              {/* Simulated Interactive Map */}
              <div className={`h-96 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} relative overflow-hidden cursor-crosshair`}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20">
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" className="text-green-500">
                      <defs>
                        <pattern id="silk-road-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#silk-road-grid)" />
                    </svg>
                  </div>
                </div>

                {/* Existing Proposals */}
                {proposedStations.map((proposal, index) => (
                  <div
                    key={proposal.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${20 + index * 12}%`,
                      top: `${25 + index * 8}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show proposal details
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full shadow-lg transition-all group-hover:scale-110 ${
                      proposal.status === 'approved' ? 'bg-green-500' :
                      proposal.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      <MapPin className="h-5 w-5 text-black m-1.5" />
                    </div>
                    
                    {/* Vote indicator */}
                    <div className={`absolute -top-2 -right-2 text-xs font-bold px-1 py-0.5 rounded-full ${
                      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } border`}>
                      {proposal.votes}
                    </div>
                  </div>
                ))}

                {/* Click instruction */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'} rounded-lg p-4 text-center`}>
                    <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Click anywhere on the map to propose a new charging station location
                    </p>
                  </div>
                </div>

                {/* Map click handler */}
                <div 
                  className="absolute inset-0 z-10"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    // Convert to approximate coordinates
                    const lat = 37.7749 + (y - 50) * 0.01;
                    const lng = -122.4194 + (x - 50) * 0.01;
                    
                    handleMapClick(lat, lng);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Proposals List */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
              <h3 className="font-semibold mb-4">Filter Proposals</h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search proposals..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Proposals List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{proposal.userName}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(proposal.priority)}`}>
                        {proposal.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(proposal.id, true)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Upvote"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium">{proposal.votes}</span>
                      <button
                        onClick={() => handleVote(proposal.id, false)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Downvote"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {proposal.description}
                  </p>

                  {proposal.notes && (
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      <strong>Notes:</strong> {proposal.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{proposal.position.lat.toFixed(4)}, {proposal.position.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{proposal.submissionDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProposals.length === 0 && (
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border border-dashed p-8 text-center`}>
                  <MapPin className={`h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    No proposals found
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {proposedStations.length === 0 
                      ? 'Be the first to propose a charging station location!'
                      : 'Try adjusting your search terms or filters'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Proposal Form Modal */}
        {showProposalForm && selectedPosition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <h3 className="text-lg font-semibold mb-4">Propose Charging Station</h3>
              
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span>
                        {selectedPosition.lat.toFixed(4)}, {selectedPosition.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Describe why this location would be ideal for a charging station..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">Low - Nice to have</option>
                    <option value="medium">Medium - Would be useful</option>
                    <option value="high">High - Critically needed</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Any additional information about accessibility, terrain, etc..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProposalForm(false);
                      setSelectedPosition(null);
                    }}
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
                    Submit Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}