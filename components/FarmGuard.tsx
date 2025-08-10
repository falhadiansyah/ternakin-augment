import React, { useEffect, useState } from 'react';
import { router, usePathname } from 'expo-router';
import { Loading } from './ui';
import { getMyProfile } from '@/lib/data';
import { useAuthContext } from './AuthProvider';

interface FarmGuardProps { children: React.ReactNode }

export default function FarmGuard({ children }: FarmGuardProps) {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      if (authLoading) return;
      if (!isAuthenticated) {
        setChecking(false);
        return;
      }
      const { profile, error } = await getMyProfile();
      console.log('FarmGuard:getMyProfile', { error: error?.message, profile, path: pathname });
      if (error || !profile || !profile.farm_id) {
        // Prevent entering tabs without farm assignment
        router.replace('/farm/select');
        setChecking(false);
        return;
      }
      setChecking(false);
    })();
  }, [isAuthenticated, authLoading, pathname]);

  if (authLoading || checking) {
    return <Loading message="Checking farm assignment..." />;
  }

  return <>{children}</>;
}

