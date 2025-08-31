import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DataGreenLogo from '@/assets/data-green-logo.svg';
import { 
  Home, 
  Building, 
  FolderOpen, 
  User, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  FileText
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

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
  { name: 'Evolução Projetos', path: '/project-evolution', icon: BarChart3 },
  { name: 'Evolução Pessoas', path: '/person-evolution', icon: Activity },
  { name: 'Relatórios', path: '/reports', icon: FileText },
  { name: 'Admin', path: '/admin', icon: Settings, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get current user session
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da plataforma",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
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
                <img src={DataGreenLogo} alt="Data Green" className="h-10 w-auto" />
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

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              // Check if item should be shown (admin items only for admin users)
              if (item.adminOnly && !user?.user_metadata?.role?.includes('admin')) {
                return null;
              }

              const Icon = item.icon;
              const active = isActive(item.path);

              if (isCollapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center justify-center h-10 w-10 rounded-lg transition-colors',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button at Bottom */}
          <div className="p-2 border-t border-border">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Sair
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
