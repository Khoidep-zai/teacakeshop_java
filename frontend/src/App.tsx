import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import './i18n';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Combos from './pages/Combos';
import ComboDetail from './pages/ComboDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Reservation from './pages/Reservation';
import ReservationTracking from './pages/ReservationTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCombos from './pages/admin/AdminCombos';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReservations from './pages/admin/AdminReservations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminPayments from './pages/admin/AdminPayments';
import AdminInventory from './pages/admin/AdminInventory';
import StaffDashboard from './pages/admin/StaffDashboard';

type AppRole = 'ADMIN' | 'CUSTOMER' | 'STAFF';

function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'STAFF' ? '/admin/orders' : '/'} replace />;
  }
  return <>{children}</>;
}

function AdminIndex() {
  const { user } = useAuth();
  return user?.role === 'STAFF'
    ? <StaffDashboard />
    : <Dashboard />;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/products/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/combos" element={<PublicLayout><Combos /></PublicLayout>} />
      <Route path="/combos/:id" element={<PublicLayout><ComboDetail /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
      <Route path="/orders/:orderCode" element={<PublicLayout><OrderTracking /></PublicLayout>} />
      <Route path="/reservation" element={<PublicLayout><Reservation /></PublicLayout>} />
      <Route path="/reservations/track" element={<PublicLayout><ReservationTracking /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/profile" element={<ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminIndex />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCategories /></ProtectedRoute>} />
        <Route path="combos" element={<AdminCombos />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
        <Route path="discounts" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDiscounts /></ProtectedRoute>} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="inventory" element={<AdminInventory />} />
      </Route>
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-8xl">🍵</div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
      <p className="text-gray-500 dark:text-gray-400">Trang bạn tìm không tồn tại</p>
      <a href="/" className="btn-primary">Về trang chủ</a>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
