'use client';

import Dashboard from './dashboard';
import { AuthenticatedSidebar } from '@/components/layout/AuthenticatedSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import './dashboard.css';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="dashboard-container p-4 lg:p-6" suppressHydrationWarning>
        <div className="flex min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)]" suppressHydrationWarning>
          <AuthenticatedSidebar activeItem="dashboard" />
          <Dashboard />
        </div>
      </div>
    </AuthGuard>
  );
}