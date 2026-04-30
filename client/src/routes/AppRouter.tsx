import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '../types/enums';

// Loading Component
const PageLoader = (): React.JSX.Element => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

// Lazy Loaded Pages
// Public
const LandingPage = lazy(() => import('../pages/LandingPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const PriestProfilePage = lazy(() => import('../pages/PriestProfilePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const BecomePriestPage = lazy(() => import('../pages/BecomePriestPage'));
const CeremoniesPage = lazy(() => import('../pages/CeremoniesPage'));

// User
const UserDashboard = lazy(() => import('../pages/user/Dashboard'));
const BookPriestWizard = lazy(() => import('../pages/user/BookPriestWizard'));
const MyBookings = lazy(() => import('../pages/user/MyBookings'));
const BookingDetail = lazy(() => import('../pages/user/BookingDetail'));
const UserProfile = lazy(() => import('../pages/user/Profile'));
const Wishlist = lazy(() => import('../pages/user/Wishlist'));

// Priest
const PriestDashboard = lazy(() => import('../pages/priest/PriestDashboard'));
const PriestBookings = lazy(() => import('../pages/priest/PriestBookings'));
const PriestCalendar = lazy(() => import('../pages/priest/PriestCalendar'));
const PriestProfile = lazy(() => import('../pages/priest/PriestProfile'));
const PriestAvailability = lazy(() => import('../pages/priest/PriestAvailability'));
const PriestEarnings = lazy(() => import('../pages/priest/PriestEarnings'));

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminVerifications = lazy(() => import('../pages/admin/AdminVerifications'));
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminDisputes = lazy(() => import('../pages/admin/AdminDisputes'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/priests/:id" element={<PriestProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/become-a-priest" element={<BecomePriestPage />} />
        <Route path="/ceremonies" element={<CeremoniesPage />} />

        {/* PROTECTED USER ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={[UserRole.USER]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:priestId"
          element={
            <ProtectedRoute roles={[UserRole.USER]}>
              <BookPriestWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={[UserRole.USER]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute roles={[UserRole.USER]}>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={[UserRole.USER]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute roles={[UserRole.USER]}>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED PRIEST ROUTES */}
        <Route
          path="/priest/dashboard"
          element={
            <ProtectedRoute roles={[UserRole.PRIEST]}>
              <PriestDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/priest/bookings"
          element={
            <ProtectedRoute roles={[UserRole.PRIEST]}>
              <PriestBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/priest/calendar"
          element={
            <ProtectedRoute roles={[UserRole.PRIEST]}>
              <PriestCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/priest/profile"
          element={
            <ProtectedRoute roles={[UserRole.PRIEST]}>
              <PriestProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/priest/availability"
          element={
            <ProtectedRoute roles={[UserRole.PRIEST]}>
              <PriestAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/priest/earnings"
          element={
            <ProtectedRoute roles={[UserRole.PRIEST]}>
              <PriestEarnings />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminVerifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminDisputes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
