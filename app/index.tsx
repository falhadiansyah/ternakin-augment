import { useAuthContext } from '@/components/AuthProvider';
import { Loading } from '@/components/ui';
import { getMyProfile } from '@/lib/data';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const { isAuthenticated, loading } = useAuthContext();
  const [checkingFarm, setCheckingFarm] = useState(true);
  const [needsFarm, setNeedsFarm] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) { setCheckingFarm(false); return; }
      const { profile, error } = await getMyProfile();
      console.log('Index:getMyProfile', { error: error?.message, profile });
      // If cannot read profile or no profile/farm_id, route to farm selection
      if (error || !profile || !profile.farm_id) {
        setNeedsFarm(true);
        setCheckingFarm(false);
        return;
      }
      setNeedsFarm(false);
      setCheckingFarm(false);
    })();
  }, [isAuthenticated]);

  if (loading || checkingFarm) {
    return <Loading message="Loading..." />;
  }

  if (isAuthenticated) {
    if (needsFarm) return <Redirect href="/farm/select" />;
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/auth/login" />;
}
