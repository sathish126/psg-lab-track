import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { ROUTES } from '@/lib/utils/constants';
import {
  LayoutDashboard,
  Package,
  Building2,
  QrCode,
  Calendar,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/utils/constants';

const navItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    to: ROUTES.DASHBOARD,
    roles: [UserRole.PRINCIPAL, UserRole.HOD, UserRole.FACULTY, UserRole.LAB_ASSISTANT],
  },
  { 
    icon: Package, 
    label: 'Equipment', 
    to: ROUTES.EQUIPMENT,
    roles: [UserRole.PRINCIPAL, UserRole.HOD, UserRole.FACULTY, UserRole.LAB_ASSISTANT],
  },
  { 
    icon: Building2, 
    label: 'Labs', 
    to: ROUTES.LABS,
    roles: [UserRole.PRINCIPAL, UserRole.HOD],
  },
  { 
    icon: QrCode, 
    label: 'Verification', 
    to: ROUTES.VERIFICATION,
    roles: [UserRole.PRINCIPAL, UserRole.HOD, UserRole.FACULTY, UserRole.LAB_ASSISTANT],
  },
  { 
    icon: Calendar, 
    label: 'Calendar', 
    to: ROUTES.CALENDAR,
    roles: [UserRole.PRINCIPAL, UserRole.HOD, UserRole.FACULTY, UserRole.LAB_ASSISTANT],
  },
  { 
    icon: FileText, 
    label: 'Reports', 
    to: ROUTES.REPORTS,
    roles: [UserRole.PRINCIPAL, UserRole.HOD],
  },
  { 
    icon: Users, 
    label: 'Users', 
    to: ROUTES.USERS,
    roles: [UserRole.PRINCIPAL],
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    to: ROUTES.SETTINGS,
    roles: [UserRole.PRINCIPAL, UserRole.HOD, UserRole.FACULTY, UserRole.LAB_ASSISTANT],
  },
];

export const Sidebar = () => {
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">PSG Track</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {filteredItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      {user && (
        <div className={cn(
          'p-4 border-t border-sidebar-border',
          collapsed && 'px-2'
        )}>
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'flex-col gap-2'
          )}>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-gradient-primary text-white">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
