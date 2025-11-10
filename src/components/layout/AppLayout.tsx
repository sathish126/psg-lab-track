import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      
      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <Header sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 p-6 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
