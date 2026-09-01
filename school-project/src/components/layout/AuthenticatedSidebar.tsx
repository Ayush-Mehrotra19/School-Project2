'use client';

import React, { useState, useEffect } from 'react';
import { Home, BarChart3, CheckSquare, Clock, Settings, HelpCircle, LogOut, User } from 'lucide-react';
import { SidebarNavItem } from '@/components/ui/SidebarNavItem';
import { createClient } from '@/lib/supabase/client';
import type { NavItem, SidebarUser } from '@/types/sidebar';

interface AuthenticatedSidebarProps {
  activeItem?: string;
}

export function AuthenticatedSidebar({ activeItem = 'dashboard' }: AuthenticatedSidebarProps) {
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userData: SidebarUser = {
            name: session.user.user_metadata?.display_name || session.user.user_metadata?.username || 'User',
            handle: `@${session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user'}`,
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url || null
          };
          setUser(userData);
        } else if (typeof window !== 'undefined' && localStorage.getItem('growmyiq_user')) {
          const savedUser = JSON.parse(localStorage.getItem('growmyiq_user')!);
          setUser({
            name: savedUser.name || 'Student',
            handle: savedUser.handle || '@student',
            email: savedUser.email || '',
            avatar_url: null
          });
        }
      } catch (error) {
        if (typeof window !== 'undefined' && localStorage.getItem('growmyiq_user')) {
          const savedUser = JSON.parse(localStorage.getItem('growmyiq_user')!);
          setUser({
            name: savedUser.name || 'Student',
            handle: savedUser.handle || '@student',
            email: savedUser.email || '',
            avatar_url: null
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: SidebarUser = {
            name: session.user.user_metadata?.display_name || session.user.user_metadata?.username || 'User',
            handle: `@${session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user'}`,
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url || null
          };
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('growmyiq_user');
          }
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('growmyiq_user');
      }
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('growmyiq_user');
      }
      window.location.href = '/auth';
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      href: '/dashboard',
      isActive: activeItem === 'dashboard'
    },
    {
      id: 'quizzer',
      label: 'Quizzer',
      icon: 'check-square',
      href: '/quizzer',
      isActive: activeItem === 'quizzer'
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: 'clock',
      href: '/timetable',
      isActive: activeItem === 'timetable'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'bar-chart',
      href: '/analytics',
      isActive: activeItem === 'analytics'
    }
  ];

  const bottomNavItems: NavItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      href: '/settings'
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: 'help-circle',
      href: '/help'
    }
  ];

  if (isLoading) {
    return (
      <aside className="hidden lg:block w-64 sidebar-dark rounded-2xl p-6 mr-6 flex-shrink-0 relative">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-8"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-64 sidebar-dark rounded-2xl p-6 mr-6 flex-shrink-0 relative">
      {/* App Logo/Header */}
      <div className="mb-8 pb-4 border-b border-gray-700">
        <h1 className="sidebar-logo">
          <svg className="w-6 h-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944v0A11.955 11.955 0 014.382 8.984M9 16l3-3m0 0l3 3m0-3h3M9 12h3" />
          </svg>
          GrowMyIq
        </h1>
        {user && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-white">{user.name}</span>
            </div>
            <p className="sidebar-user-handle">{user.handle}</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            icon={
              item.icon === 'home' ? Home :
              item.icon === 'bar-chart' ? BarChart3 :
              item.icon === 'check-square' ? CheckSquare :
              Clock
            }
            label={item.label}
            href={item.href}
            isActive={item.isActive}
          />
        ))}
      </nav>

      {/* Bottom Settings */}
      <div className="absolute bottom-0 left-0 w-64 p-6 pt-6 border-t border-gray-700">
        <nav className="space-y-2 mb-4">
          {bottomNavItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              icon={item.icon === 'settings' ? Settings : HelpCircle}
              label={item.label}
              href={item.href}
              isBottom
            />
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
          <span className="group-hover:text-white">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}