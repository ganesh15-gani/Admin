import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import { authService } from "../../services/authService";
import { useToast } from "../ui/ToastContext";
import { ProfileSettingsModal } from "./ProfileSettingsModal";

interface TopNavbarProps {
  setIsMobileOpen: (open: boolean) => void;
}

export default function TopNavbar({ setIsMobileOpen }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToast();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Update user if auth state changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
      <div className="flex items-center flex-1">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb - Hidden on small mobile */}
        <nav className="hidden sm:flex items-center text-sm font-medium text-gray-500">
          <span className="capitalize">Admin</span>
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            return (
              <React.Fragment key={value}>
                <ChevronRight size={16} className="mx-2 text-gray-400" />
                <span className={isLast ? "text-slate-800 capitalize" : "capitalize"}>
                  {value.replace('-', ' ')}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Global Search */}
        <div className="relative hidden md:block w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            placeholder="Search anywhere..."
          />
        </div>
        
        {/* Search icon for mobile */}
        <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <Search size={20} />
        </button>

        <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <button className="hidden sm:block p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <HelpCircle size={20} />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

        {/* Admin Profile */}
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center space-x-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <div className="hidden md:flex flex-col items-end text-sm">
            <span className="font-semibold text-slate-800 leading-tight">{user?.name || 'Admin'}</span>
            <span className="text-xs text-brand-600 font-medium">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}</span>
          </div>
          {user?.avatar ? (
            <img
              className="h-9 w-9 rounded-full object-cover border border-gray-200"
              src={user.avatar}
              alt="Admin profile"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center border border-brand-200 text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
        </button>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="p-2 ml-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
      
      <ProfileSettingsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onProfileUpdated={(updatedUser) => setUser(updatedUser)}
      />
    </header>
  );
}
