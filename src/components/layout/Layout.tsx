import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import Header from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setSidebarCollapsed(JSON.parse(savedState));
      }
    };

    // Initial load
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab changes
    const handleSidebarToggle = () => handleStorageChange();
    window.addEventListener('sidebar-toggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebar-toggle', handleSidebarToggle);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        isMobile 
          ? "pb-20" // Space for bottom bar on mobile
          : sidebarCollapsed 
            ? "ml-16" // Space for collapsed sidebar
            : "ml-64", // Space for expanded sidebar
        "min-h-screen"
      )}>
        {children}
      </main>
      
      {/* Mobile Bottom Bar */}
      {isMobile && <BottomBar />}
    </div>
  );
};
