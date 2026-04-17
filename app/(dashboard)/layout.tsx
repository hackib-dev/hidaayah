'use client';

import { useState } from 'react';
import SideBar from '@/components/DashboardLayout/Sidebar';
import TopBar from '@/components/DashboardLayout/Topbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="h-screen overflow-hidden">
        <div className="fixed right-0 top-0 z-30 w-full max-w-full">
          <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>

        <div className="flex h-full">
          <div className="lg:w-60 lg:flex-shrink-0">
            <div className="fixed left-0 top-0 z-50 h-full  lg:relative">
              <SideBar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="relative mt-[52px] md:mt-[80px] overflow-y-auto p-3">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
