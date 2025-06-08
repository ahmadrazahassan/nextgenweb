'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName?: string;
  isAdmin?: boolean;
  // Add other user fields as needed from your User model
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>; // Define specific credentials type later
  register: (userData: any) => Promise<void>; // Define specific userData type later
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to check initial auth status
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data); // Adjust based on your API response structure for /api/auth/me
      } else {
        setUser(null); // Not authenticated or error
        if (response.status !== 401) { // Don't set error for typical unauthenticated responses
            const errorData = await response.json().catch(() => ({}))
            setError(errorData.message || 'Failed to fetch user status.');
        }
      }
    } catch (err: any) {
      console.error("Auth provider error:", err);
      setUser(null);
      // Don't set error for network issues to prevent bad UX
      // setError(err.message || 'An error occurred while fetching user status.');
    } finally {
      setIsLoading(false); // Always set loading to false regardless of success/failure
    }
  };

  useEffect(() => {
    // Add a try-catch to prevent unhandled errors during initialization
    try {
      fetchCurrentUser();
    } catch (err) {
      console.error("Error in auth initialization:", err);
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Login attempt with:", credentials.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      // Try to parse the response
      let data;
      try {
        data = await response.json();
        console.log("Login response:", { status: response.status, data });
      } catch (parseErr) {
        console.error("Error parsing login response:", parseErr);
        throw new Error('Invalid response from server');
      }
      
      // Handle non-OK responses
      if (!response.ok) {
        // Set error and clear loading state
        setIsLoading(false);
        
        // Handle specific error cases
        if (response.status === 401) {
          // The API returns a generic "Invalid email or password" for both cases
          // For security reasons, the API doesn't specifically say "user not found"
          // But we can infer it based on the error message and show a user-friendly message
          
          if (data.error) {
            console.log("Login error message:", data.error);
            const errorLower = data.error.toLowerCase();
            
            if (errorLower.includes('invalid email or password')) {
              // For non-existent users, modify the error message to be more helpful
              // We'll determine this is likely a "user not found" scenario
              const userNotFoundMessage = 'Account not found. Please check your email or create a new account.';
              setError(userNotFoundMessage);
              throw new Error(userNotFoundMessage);
            } else if (errorLower.includes('account locked') || errorLower.includes('locked')) {
              setError(data.error);
              throw new Error(data.error);
            }
          }
          
          // Generic unauthorized error
          setError('Authentication failed. Please check your credentials and try again.');
          throw new Error('Authentication failed. Please check your credentials and try again.');
        }
        
        // For all other errors
        setError(data.error || data.message || 'Login failed');
        throw new Error(data.error || data.message || 'Login failed');
      }
      
      // Set user on success
      setUser(data.user || data);
      
    } catch (err: any) {
      // Make sure loading state is cleared and error is set
      setIsLoading(false);
      setError(err.message || 'An error occurred during login.');
      setUser(null);
      throw err; // Re-throw to be caught by the form
    } finally {
      // Safety check to ensure loading is always false after login attempt
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      // Try to parse the response
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error("Error parsing register response:", parseErr);
        setIsLoading(false);
        throw new Error('Invalid response from server');
      }
      
      // Handle non-OK responses
      if (!response.ok) {
        setIsLoading(false);
        setError(data.error || data.message || 'Registration failed');
        throw new Error(data.error || data.message || 'Registration failed');
      }
      
      // After successful registration, fetch the user
      await fetchCurrentUser();
      
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An error occurred during registration.');
      setUser(null);
      throw err; // Re-throw to be caught by the form
    } finally {
      // Safety check to ensure loading is always false
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Logout failed');
      }
      setUser(null);
      // router.push('/login'); // Optional: redirect after logout
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout.');
    } finally {
      setIsLoading(false); // Always ensure loading state is reset
    }
  };

  const clearError = () => setError(null);

  // Return early with just children if there's a critical error
  // to prevent the app from being unusable
  if (error && process.env.NODE_ENV === 'production') {
    console.error("Critical auth error:", error);
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 