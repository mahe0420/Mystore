import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      // Additional validation for URL copying protection
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        // Check token expiration
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp < currentTime) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setIsValidating(false);
          return;
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
      
      setIsValidating(false);
    };

    validateAccess();
  }, [location.pathname]);

  if (loading || isValidating) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;