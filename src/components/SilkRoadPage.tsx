import React, { useState, useEffect } from 'react';
import { MapPin, Plus, ThumbsUp, ThumbsDown, Search, Star, Clock, User, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import InteractiveMap from './InteractiveMap';
import LoadingSpinner from './LoadingSpinner';

interface ProposedStation {
  id: string;
  userId: string;
  userName: string;
  position: [number, number];
  description: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  submissionDate: Date;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function SilkRoadPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [proposedStations, setProposedStations] = useState<ProposedStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  useEffect(() => {
    loadProposedStations();
  }, []);

  const loadProposedStations = async () => {
    setLoading(true);
    try {
      // Mock data for demo - replace with Supabase query
      const mockStations: ProposedStation[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Alex Chen',
          position: [37.9838, 23.7275], // Athens
          description: 'Strategic location near Athens International Airport for international drone routes',
          priority: 'high',
          notes: 'High traffic area with good infrastructure',
          submissionDate: new Date('2024-01-10'),
          votes: 15,
          status: 'approved'
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Maria Rodriguez',
          position: [44.7866, 20.4489], // Belgrade
          description: 'Central Balkans hub connecting Eastern and Western Europe',
          priority: 'high',
          notes: 'Perfect midpoint for Athens-Berlin routes',
          submissionDate: new Date('2024-01-12'),
          votes: 12,
          status: 'pending'
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'John Smith',
          position: [45.4642, 9.1900], // Milan
          description: 'Northern Italy charging hub for Alpine crossings',
          priority: 'medium',
          notes: 'Good for Switzerland and France connections',
          submissionDate: new Date('2024-01-15'),
          votes: 8,
          status: 'pending'
        }
      ];
      
      setProposedStations(mockStations);
    } catch (error) {
      showError('Error', 'Failed to load proposed stations');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    setShowProposalForm(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPosition || !user) {
      showError('Error', 'Please select a location and ensure you are logged in');
      return;
    }

    try {
      const newProposal: ProposedStation = {
        id: Date.now().toString(),
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

      setProposedStations([newProposal, ...proposedStations]);
      
      setShowProposalForm(false);
      setSelectedPosition(null);
      setFormData({ description: '', priority: 'medium', notes: '' });
      
      showSuccess('Proposal Submitted', 'Your recharge station proposal has been submitted for community review.');
    } catch (error) {
      showError('Error', 'Failed to submit proposal');
    }
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
    
    setProposedStations(updated);
    showSuccess('Vote Recorded', `Your ${isUpvote ? 'upvote' : 'downvote'} has been recorded.`);
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

  const mapMarkers = proposedStations.map(station => ({
    id: station.id,
    position: station.position,
    title: station.description,
    type: 'proposal' as const
  }));

  const routes = [
    {
      id: 'athens-serbia',
      points: [
        [37.9838, 23.7275] as [number, number], // Athens
        [44.7866, 20.4489] as [number, number], // Belgrade
      ],
      color: '#10B981'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="lg" text="Loading Silk Road..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-full">
              <MapPin className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Silk Road</h1>
              <p className="text-lg text-gray-400">
                Propose new recharge station locations to expand our global network
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-500/30">
            <p className="text-sm text-blue-300">
              💡 <strong>Inspired by the historic Silk Road:</strong> Help us build a connected network of charging stations 
              that enables drone pilots to fly anywhere in the world. Click on the map to propose strategic locations!
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border-gray-700 rounded-lg border p-4">
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

              <InteractiveMap
                center={[41.9028, 12.4964]} // Rome (center of Europe)
                zoom={5}
                markers={mapMarkers}
                routes={routes}
                onMapClick={handleMapClick}
                className="h-96"
              />
              
              <div className="mt-4 text-sm text-gray-400">
                <p>Click anywhere on the map to propose a new charging station location</p>
              </div>
            </div>
          </div>

          {/* Proposals List */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-gray-800 border-gray-700 rounded-lg border p-4">
              <h3 className="font-semibold mb-4">Filter Proposals</h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search proposals..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="bg-gray-800 border-gray-700 rounded-lg border p-4 hover:shadow-lg transition-all"
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

                  <p className="text-sm mb-2 text-gray-300">
                    {proposal.description}
                  </p>

                  {proposal.notes && (
                    <p className="text-xs text-gray-400 mb-2">
                      <strong>Notes:</strong> {proposal.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{proposal.position[0].toFixed(4)}, {proposal.position[1].toFixed(4)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{proposal.submissionDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProposals.length === 0 && (
                <div className="bg-gray-800 border-gray-700 rounded-lg border border-dashed p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    No proposals found
                  </h3>
                  <p className="text-gray-500">
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
        {showProposalForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Propose Charging Station</h3>
              
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Location
                  </label>
                  <div className="p-3 rounded-lg bg-gray-700 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span>
                        {selectedPosition ? 
                          `${selectedPosition[0].toFixed(4)}, ${selectedPosition[1].toFixed(4)}` : 
                          'Click on map to select location'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe why this location would be ideal for a charging station..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low - Nice to have</option>
                    <option value="medium">Medium - Would be useful</option>
                    <option value="high">High - Critically needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium rounded-lg transition-all flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
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