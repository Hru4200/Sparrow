import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Search, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export default function Blog() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: false
  });

  // Check if user is admin (hardcoded for demo)
  const isAdmin = user?.email === 'demo@sparrow.com' || user?.id === 'admin';

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Mock data for demo - replace with Supabase query
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Welcome to Sparrow Network',
          content: `# Welcome to Sparrow Network

We're excited to launch the world's first peer-to-peer drone charging network! 

## What is Sparrow?

Sparrow connects drone pilots worldwide, enabling:
- **Global charging network** - Find charging stations anywhere
- **Community-driven** - Hosted by pilots, for pilots  
- **Smart routing** - Plan long-distance flights with automatic charging stops
- **Credit system** - Earn by hosting, spend to charge

## Getting Started

1. Register your drones in the fleet manager
2. Explore charging stations on the interactive map
3. Plan routes with our advanced route builder
4. Propose new stations via Silk Road

Join the revolution in drone connectivity!`,
          author_id: 'admin',
          author_name: 'Sparrow Team',
          is_published: true,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'New Route Planning Features',
          content: `# Enhanced Route Planning

We've added powerful new features to help you plan complex routes:

## Multi-Stop Routes
- Plan routes with multiple charging stops
- Automatic station suggestions based on drone range
- Real-time availability checking

## Distance Calculations
- Precise KM calculations using GPS coordinates
- Battery usage estimates per drone model
- Range warnings and optimization suggestions

## Visual Route Builder
- Interactive map with drag-and-drop waypoints
- Live route visualization with polylines
- Station approval workflow

Try it out in the route planner today!`,
          author_id: 'admin',
          author_name: 'Development Team',
          is_published: true,
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-01-20')
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      showError('Error', 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        author_id: user!.id,
        author_name: user!.name,
        is_published: formData.is_published,
        created_at: new Date(),
        updated_at: new Date()
      };

      if (editingPost) {
        setPosts(posts.map(p => p.id === editingPost.id ? { ...newPost, id: editingPost.id } : p));
        showSuccess('Success', 'Post updated successfully');
      } else {
        setPosts([newPost, ...posts]);
        showSuccess('Success', 'Post created successfully');
      }

      resetForm();
    } catch (error) {
      showError('Error', 'Failed to save post');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', is_published: false });
    setShowCreateForm(false);
    setEditingPost(null);
  };

  const handleEdit = (post: BlogPost) => {
    if (!isAdmin) return;
    setFormData({
      title: post.title,
      content: post.content,
      is_published: post.is_published
    });
    setEditingPost(post);
    setShowCreateForm(true);
  };

  const handleDelete = (postId: string) => {
    if (!isAdmin) return;
    setPosts(posts.filter(p => p.id !== postId));
    showSuccess('Success', 'Post deleted successfully');
  };

  const filteredPosts = posts
    .filter(post => post.is_published || isAdmin)
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <LoadingSpinner size="lg" text="Loading blog posts..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Sparrow Blog</h1>
          <p className="text-gray-400 text-lg">
            Latest updates and insights from the drone community
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-2 px-4 rounded-lg transition-all flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Post
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={15}
                    placeholder="Write your post content in Markdown..."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="published" className="text-sm">Publish immediately</label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium rounded-lg transition-all"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full Post View */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center space-x-4 mb-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{selectedPost.author_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedPost.created_at.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 hover:text-green-400 cursor-pointer"
                      onClick={() => setSelectedPost(post)}>
                    {post.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.created_at.toLocaleDateString()}</span>
                    </div>
                    {!post.is_published && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="Edit post"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-gray-300 mb-4 line-clamp-3">
                {post.content.substring(0, 200)}...
              </div>
              
              <button
                onClick={() => setSelectedPost(post)}
                className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Read more</span>
              </button>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No blog posts available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}