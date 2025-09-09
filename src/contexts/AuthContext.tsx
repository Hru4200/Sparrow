import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  isAdmin?: boolean;
  welcomeCreditsAwarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCredits: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to mock data for demo
      setUser({
        id: userId,
        email: 'demo@sparrow.com',
        name: 'Demo User',
        credits: 50,
        isAdmin: false,
        welcomeCreditsAwarded: true
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // For demo purposes, use mock authentication
      if (email === 'demo@sparrow.com' && password === 'password') {
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@sparrow.com',
          name: 'Demo User',
          credits: 50,
          isAdmin: false,
          welcomeCreditsAwarded: true
        };
        setUser(mockUser);
        localStorage.setItem('sparrow_user', JSON.stringify(mockUser));
        return { success: true };
      }

      // Real Supabase auth (commented out for demo)
      /*
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
      */

      return { success: false, error: 'Invalid credentials. Try demo@sparrow.com / password' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // For demo purposes, create mock user
      const mockUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        credits: 0, // Will be awarded 50 credits in welcome flow
        isAdmin: false,
        welcomeCreditsAwarded: false
      };
      setUser(mockUser);
      localStorage.setItem('sparrow_user', JSON.stringify(mockUser));
      return { success: true };

      // Real Supabase auth (commented out for demo)
      /*
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user?.id,
            email,
            name,
            credits: 0,
            welcome_credits_awarded: false
          }
        ]);

      if (profileError) throw profileError;
      return { success: true };
      */
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('sparrow_user');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.removeItem('sparrow_user');
    }
  };

  const updateCredits = async (amount: number) => {
    if (!user) return;

    const updatedUser = { ...user, credits: user.credits + amount };
    setUser(updatedUser);
    localStorage.setItem('sparrow_user', JSON.stringify(updatedUser));

    // Real database update (commented out for demo)
    /*
    try {
      const { error } = await supabase
        .from('users')
        .update({ credits: updatedUser.credits })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating credits:', error);
    }
    */
  };

  // Load user from localStorage on mount (for demo persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('sparrow_user');
    if (storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateCredits
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}