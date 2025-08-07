import React, { createContext, useContext } from 'react';
import { useAuth } from '@/lib/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<any>;
  signInWithOTP: (email: string) => Promise<any>;
  verifyOTP: (email: string, token: string) => Promise<any>;
  signOut: () => Promise<any>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
