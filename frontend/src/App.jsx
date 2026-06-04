import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import UserLayout from './pages/UserLayout';
import AdminLayout from './pages/AdminLayout';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="loading-spinner"/></div>;
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/home/*" element={<PrivateRoute role="user"><UserLayout /></PrivateRoute>} />
          <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
