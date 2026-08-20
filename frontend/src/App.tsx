import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import { ToastProvider } from './components/ui/ToastContext';
import { authService } from './services/authService';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import UserList from './pages/users/UserList';
import RoommateMatching from './pages/users/RoommateMatching';
import PropertyList from './pages/properties/PropertyList';
import BookingList from './pages/bookings/BookingList';
import PaymentList from './pages/payments/PaymentList';
import AdminManagement from './pages/settings/AdminManagement';

import Vendors from './pages/vendors/Vendors';
import BankApprovals from './pages/vendors/BankApprovals';
import Support from './pages/support/Support';
import Notifications from './pages/notifications/Notifications';
import Reports from './pages/reports/Reports';
import CMS from './pages/cms/CMS';
import Settings from './pages/settings/Settings';
import SuperAdmin from './pages/settings/SuperAdmin';
import System from './pages/settings/System';
import StaffList from './pages/settings/StaffList';

import AccessDenied from './pages/auth/AccessDenied';

// Protected Route Wrapper
function ProtectedRoute({ children, requiredModule }: { children: React.ReactNode, requiredModule?: string }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredModule && !authService.hasPermission(requiredModule)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function DefaultRoute() {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (authService.hasPermission('Dashboard')) return <Navigate to="/dashboard" replace />;
  if (authService.hasPermission('Properties')) return <Navigate to="/properties" replace />;
  if (authService.hasPermission('Users')) return <Navigate to="/users" replace />;
  if (authService.hasPermission('Bookings')) return <Navigate to="/bookings" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<DefaultRoute />} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<ProtectedRoute requiredModule="Dashboard"><Dashboard /></ProtectedRoute>} />
          
          <Route path="users" element={<ProtectedRoute requiredModule="Users"><UserList /></ProtectedRoute>} />
          <Route path="users/roommates" element={<ProtectedRoute requiredModule="Users"><RoommateMatching /></ProtectedRoute>} />
          
          <Route path="properties" element={<ProtectedRoute requiredModule="Properties"><PropertyList /></ProtectedRoute>} />
          <Route path="bookings" element={<ProtectedRoute requiredModule="Bookings"><BookingList /></ProtectedRoute>} />
          <Route path="payments" element={<ProtectedRoute requiredModule="Payments"><PaymentList /></ProtectedRoute>} />
          
          <Route path="vendors" element={<ProtectedRoute requiredModule="Vendors"><Vendors /></ProtectedRoute>} />
          <Route path="vendors/banks" element={<ProtectedRoute requiredModule="Vendors"><BankApprovals /></ProtectedRoute>} />
          
          <Route path="support" element={<ProtectedRoute requiredModule="Support"><Support /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute requiredModule="Notifications"><Notifications /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute requiredModule="Reports"><Reports /></ProtectedRoute>} />
          <Route path="cms" element={<ProtectedRoute requiredModule="CMS"><CMS /></ProtectedRoute>} />
          
          <Route path="settings" element={<ProtectedRoute requiredModule="Settings"><Settings /></ProtectedRoute>} />
          <Route path="settings/admins" element={<ProtectedRoute requiredModule="System"><AdminManagement /></ProtectedRoute>} />
          <Route path="settings/staff" element={<ProtectedRoute requiredModule="System"><StaffList /></ProtectedRoute>} />
          <Route path="super-admin" element={<ProtectedRoute requiredModule="System"><SuperAdmin /></ProtectedRoute>} />
          <Route path="system" element={<ProtectedRoute requiredModule="System"><System /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default function AppWrapper() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}
