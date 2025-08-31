import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';

export const Navbar: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return isMobile ? <BottomBar /> : <Sidebar />;
};
