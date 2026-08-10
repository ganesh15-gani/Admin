import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-light">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNavbar setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
