import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced JWT validation for URL copying protection
  const validateSession = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        return false;
      }

      // Check if token is expired
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenPayload.exp < currentTime) {
        console.log('Token expired, clearing session');
        authService.logout();
        setUser(null);
        return false;
      }

      // Verify with server
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        return true;
      } else {
        authService.logout();
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      authService.logout();
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Always validate session on app load
      await validateSession();
      
      setLoading(false);
    };

    initializeAuth();

    // Listen for storage changes (when user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Validate session every 5 minutes
    const sessionCheckInterval = setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(sessionCheckInterval);
    };
  }, []);

  // Enhanced URL protection - validate on every route change
  useEffect(() => {
    const handleRouteChange = async () => {
      const protectedRoutes = ['/profile', '/admin', '/cart'];
      const currentPath = window.location.pathname;
      
      if (protectedRoutes.some(route => currentPath.startsWith(route))) {
        const isValid = await validateSession();
        if (!isValid) {
          window.location.href = '/login';
        }
      }
    };

    // Check on initial load and route changes
    handleRouteChange();
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { user: newUser } = await authService.register({ email, password, name });
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: loggedInUser } = await authService.login({ email, password });
      setUser(loggedInUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Force redirect to login
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};