import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Calendar, User, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useToast } from '../hooks/useToast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  publishDate: Date;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogProps {
  theme: 'dark' | 'light';
}

const BLOG_STORAGE_KEY = 'sparrow_blog_posts';

export default function Blog({ theme }: BlogProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'post'>('list');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false
  });

  useEffect(() => {
    const storedPosts = loadFromStorage(BLOG_STORAGE_KEY, []);
    // Convert date strings back to Date objects
    const postsWithDates = storedPosts.map((post: any) => ({
      ...post,
      publishDate: new Date(post.publishDate),
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    }));
    setPosts(postsWithDates);
  }, []);

  const savePosts = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts);
    saveToStorage(BLOG_STORAGE_KEY, updatedPosts);
  };

  const generateExcerpt = (content: string) => {
    const plainText = content.replace(/[#*`]/g, '').replace(/\n/g, ' ');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.title.trim() || !formData.content.trim()) {
      showError('Validation Error', 'Title and content are required');
      return;
    }

    const now = new Date();
    
    if (editingPost) {
      // Update existing post
      const updatedPost: BlogPost = {
        ...editingPost,
        title: formData.title,
        content: formData.content,
        excerpt: generateExcerpt(formData.content),
        published: formData.published,
        updatedAt: now
      };
      
      const updatedPosts = posts.map(post => 
        post.id === editingPost.id ? updatedPost : post
      );
      
      savePosts(updatedPosts);
      showSuccess('Post Updated', 'Your blog post has been updated successfully');
    } else {
      // Create new post
      const newPost: BlogPost = {
        id: `post_${Date.now()}`,
        title: formData.title,
        content: formData.content,
        excerpt: generateExcerpt(formData.content),
        authorId: user.id,
        authorName: user.name,
        publishDate: now,
        published: formData.published,
        createdAt: now,
        updatedAt: now
      };
      
      savePosts([newPost, ...posts]);
      showSuccess('Post Created', 'Your blog post has been created successfully');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', published: false });
    setShowEditor(false);
    setEditingPost(null);
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      content: post.content,
      published: post.published
    });
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleDelete = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const updatedPosts = posts.filter(post => post.id !== postId);
      savePosts(updatedPosts);
      showSuccess('Post Deleted', 'The blog post has been deleted');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (user?.isAdmin || post.published);
  });

  const isAdmin = user?.isAdmin || user?.id === 'demo-user-id'; // Demo admin access

  if (viewMode === 'post' && selectedPost) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedPost(null);
            }}
            className={`mb-6 text-green-400 hover:text-green-300 transition-colors`}
          >
            ← Back to Blog
          </button>
          
          <article className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{selectedPost.authorName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedPost.publishDate.toLocaleDateString()}</span>
                </div>
              </div>
            </header>
            
            <div className={`prose prose-lg max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
              <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Sparrow Blog</h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Latest updates and insights from the drone community
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setShowEditor(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-3 px-6 rounded-lg transition-all flex items-center group shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Post
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts..."
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 hover:shadow-lg transition-all cursor-pointer group`}
              onClick={() => {
                setSelectedPost(post);
                setViewMode('post');
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    {post.excerpt}
                  </p>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(post);
                      }}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      title="Edit post"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id);
                      }}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-red-900' : 'hover:bg-red-100'} text-red-400 transition-colors`}
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{post.authorName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.publishDate.toLocaleDateString()}</span>
                </div>
              </div>
              
              {!post.published && isAdmin && (
                <div className="mt-3 px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                  Draft
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border border-dashed p-12 text-center`}>
            <Eye className={`h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              {posts.length === 0 ? 'No posts yet' : 'No posts match your search'}
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {posts.length === 0 && isAdmin
                ? 'Create your first blog post to get started'
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        )}

        {/* Editor Modal */}
        {showEditor && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter post title..."
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Content (Markdown supported)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Write your post content here..."
                    rows={12}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="published" className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Publish immediately
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
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
                    {editingPost ? 'Update Post' : 'Create Post'}
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