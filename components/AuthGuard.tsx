import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthContext } from './AuthProvider';
import { Loading } from './ui';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Loading message="Redirecting to login..." />;
  }

  return <>{children}</>;
}
