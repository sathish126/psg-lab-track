import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const location = useLocation();

  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);

  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-muted-foreground', className)}>
      <Link to="/" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.href && index !== breadcrumbItems.length - 1 ? (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={cn(index === breadcrumbItems.length - 1 && 'text-foreground font-medium')}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    equipment: 'Equipment',
    labs: 'Labs',
    verification: 'Verification',
    calendar: 'Calendar',
    reports: 'Reports',
    users: 'Users',
    settings: 'Settings',
    create: 'Create',
    edit: 'Edit',
    scan: 'Scan',
  };

  segments.forEach((segment, index) => {
    const label = labels[segment] || segment;
    const href = '/' + segments.slice(0, index + 1).join('/');
    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}
