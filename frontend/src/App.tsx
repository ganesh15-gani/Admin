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

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/roommates" element={<RoommateMatching />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="bookings" element={<BookingList />} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="settings/admins" element={<AdminManagement />} />
          
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/banks" element={<BankApprovals />} />
          <Route path="support" element={<Support />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="cms" element={<CMS />} />
          <Route path="settings" element={<Settings />} />
          <Route path="super-admin" element={<SuperAdmin />} />
          <Route path="system" element={<System />} />
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
