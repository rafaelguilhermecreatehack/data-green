import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building, 
  FolderOpen, 
  User, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Início', path: '/dashboard', icon: Home },
  { name: 'Comunidades', path: '/communities', icon: Building },
  { name: 'Projetos', path: '/projects', icon: FolderOpen },
  { name: 'Pessoas', path: '/people', icon: User },
  { name: 'Investidores', path: '/investors', icon: DollarSign },
  { name: 'Aportes', path: '/aportes', icon: TrendingUp },
];

export const BottomBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t border-border p-2 flex justify-around items-center z-40 safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              'flex flex-col items-center text-xs font-medium transition-colors min-w-0 flex-1 py-2 px-1',
              'hover:text-primary',
              active 
                ? 'text-primary' 
                : 'text-muted-foreground'
            )}
          >
            <Icon className={cn(
              'h-5 w-5 mb-1',
              active && 'text-primary'
            )} />
            <span className="truncate w-full text-center leading-tight">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
