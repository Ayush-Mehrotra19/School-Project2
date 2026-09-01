import React from 'react';
import { Home, BarChart3, CheckSquare, Clock, Settings, HelpCircle } from 'lucide-react';
import { SidebarNavItem } from '@/components/ui/SidebarNavItem';
import type { NavItem, SidebarUser } from '@/types/sidebar';

interface SidebarProps {
  activeItem?: string;
  user?: SidebarUser;
}

export function Sidebar({ activeItem = 'dashboard', user = { name: 'User', handle: '@user.cosmic' } }: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      href: '/dashboard',
      isActive: activeItem === 'dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'bar-chart',
      href: '/analytics',
      isActive: activeItem === 'analytics'
    },
    {
      id: 'tasks',
      label: 'Task List',
      icon: 'check-square',
      href: '/tasks',
      isActive: activeItem === 'tasks'
    },
    {
      id: 'tracking',
      label: 'Tracking',
      icon: 'clock',
      href: '/tracking',
      isActive: activeItem === 'tracking'
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
        <p className="sidebar-user-handle">{user.handle}</p>
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
        <nav className="space-y-2">
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
      </div>
    </aside>
  );
}