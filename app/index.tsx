import { useAuthContext } from '@/components/AuthProvider';
import { Loading } from '@/components/ui';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <Loading message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/auth/login" />;
}
