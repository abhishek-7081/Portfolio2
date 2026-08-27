import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="route-loader">
        <div className="route-loader__panel">
          <span className="section-tag">Secure access</span>
          <h2>Checking your admin session...</h2>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
