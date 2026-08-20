import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  Calendar, 
  CreditCard, 
  Store, 
  LifeBuoy, 
  Bell, 
  BarChart, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Activity,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { settingsService } from '../../services/settingsService';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'Dashboard' },
  { name: 'Users', path: '/users', icon: Users, module: 'Users' },
  { name: 'Roommate Matches', path: '/users/roommates', icon: Users, module: 'Users' },
  { name: 'Properties', path: '/properties', icon: Home, module: 'Properties' },
  { name: 'Bookings', path: '/bookings', icon: Calendar, module: 'Bookings' },
  { name: 'Payments', path: '/payments', icon: CreditCard, module: 'Payments' },
  { name: 'Vendors', path: '/vendors', icon: Store, module: 'Vendors' },
  { name: 'Bank Approvals', path: '/vendors/banks', icon: Store, module: 'Vendors' },
  { name: 'Support', path: '/support', icon: LifeBuoy, module: 'Support' },
  { name: 'Notifications', path: '/notifications', icon: Bell, module: 'Notifications' },
  { name: 'Reports', path: '/reports', icon: BarChart, module: 'Reports' },
  { name: 'CMS', path: '/cms', icon: FileText, module: 'CMS' },
  { name: 'Staff Permissions', path: '/settings/staff', icon: ShieldCheck, module: 'System' },
  { name: 'Settings', path: '/settings', icon: Settings, module: 'Settings' },
  { name: 'System', path: '/system', icon: Activity, module: 'System' },
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [platformName, setPlatformName] = useState(settingsService.getSettings().platformName);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setPlatformName(settingsService.getSettings().platformName);
    };
    window.addEventListener('settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings_updated', handleSettingsUpdate);
  }, []);

  // Split name for styling (e.g. "Stay" in brand color, "Zen" in black)
  const formatLogoName = (name: string) => {
    if (!name) return { first: 'S', second: 'Z' };
    const middleIndex = Math.ceil(name.length / 2);
    return {
      first: name.substring(0, middleIndex),
      second: name.substring(middleIndex)
    };
  };

  const formattedName = formatLogoName(platformName);
  const collapsedInitials = (platformName.substring(0, 2)).toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className={cn("font-bold text-xl text-slate-800 transition-all duration-300 flex items-center overflow-hidden whitespace-nowrap", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <span className="text-brand-600">{formattedName.first}</span>{formattedName.second}
        </div>
        {!isCollapsed && <div className="hidden md:block w-8 h-8"></div> /* Spacer for logo centering */}
        {isCollapsed && <span className="mx-auto font-bold text-brand-600 text-xl md:block hidden">{collapsedInitials}</span>}
        
        {/* Mobile close button */}
        <button 
          className="md:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          onClick={() => setIsMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300">
        <nav className="space-y-1 px-2">
          {navItems.filter(item => authService.hasPermission(item.module)).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group relative",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-gray-100 hover:text-slate-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "flex-shrink-0 h-5 w-5 transition-colors",
                      isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600",
                      isCollapsed ? "mx-auto" : "mr-3"
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop collapse toggle */}
      <div className="hidden md:flex p-4 border-t border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex justify-center items-center p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-gray-900/50 z-40 md:hidden transition-opacity",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar - Desktop & Mobile */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white transition-all duration-300 transform md:relative md:translate-x-0 flex-shrink-0",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
          !isMobileOpen && (isCollapsed ? "md:w-20" : "md:w-64")
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
