import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useLenis } from './hooks/useLenis';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import HomePage from './pages/HomePage';

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -18,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 1, 1]
    }
  }
};

const RouteShell = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();

  useLenis();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <RouteShell>
              <HomePage />
            </RouteShell>
          }
        />
        <Route
          path="/admin/login"
          element={
            <RouteShell>
              <AdminLoginPage />
            </RouteShell>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RouteShell>
                <AdminDashboardPage />
              </RouteShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
