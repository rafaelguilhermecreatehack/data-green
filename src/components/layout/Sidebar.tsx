import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FolderOpen, 
  User, 
  DollarSign, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Início', path: '/dashboard', icon: Home },
  { name: 'Comunidades', path: '/communities', icon: Building },
  { name: 'Projetos', path: '/projects', icon: FolderOpen },
  { name: 'Pessoas', path: '/people', icon: User },
  { name: 'Investidores', path: '/investors', icon: DollarSign },
  { name: 'Aportes', path: '/aportes', icon: TrendingUp },
  { name: 'Admin', path: '/admin', icon: Settings, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage whenever it changes
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    // Dispatch custom event to notify Layout component
    window.dispatchEvent(new Event('sidebar-toggle'));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <TooltipProvider>
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-background border-r border-border transition-all duration-300 z-40',
        isCollapsed ? 'w-16' : 'w-64'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OH</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-none">ONG Harmony</span>
                  <span className="text-xs text-muted-foreground leading-none">Dashboard</span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className={cn(
                "h-8 w-8 p-0",
                isCollapsed && "mx-auto"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              // Skip admin-only items for now (we'll add role checking later)
              if (item.adminOnly) return null;

              const linkContent = (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    'flex items-center p-3 rounded-lg text-sm font-medium transition-colors',
                    'hover:bg-muted hover:text-foreground',
                    active 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground',
                    isCollapsed ? 'justify-center' : 'justify-start'
                  )}
                >
                  <Icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  );
};
