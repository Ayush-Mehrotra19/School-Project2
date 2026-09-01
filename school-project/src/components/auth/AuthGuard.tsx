'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session || (typeof window !== 'undefined' && localStorage.getItem('growmyiq_user'))) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/auth');
        }
      } catch (error) {
        if (typeof window !== 'undefined' && localStorage.getItem('growmyiq_user')) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          router.push('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" suppressHydrationWarning></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}