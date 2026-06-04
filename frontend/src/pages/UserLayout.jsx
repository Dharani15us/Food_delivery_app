import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePage from './user/HomePage';
import OrdersPage from './user/OrdersPage';
import CartPage from './user/CartPage';
import LocationPage from './user/LocationPage';
import PaymentPage from './user/PaymentPage';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth'); };

  const navItems = [
    { to: '/home', label: 'Home', icon: 'fa-house', end: true },
    { to: '/home/orders', label: 'Orders', icon: 'fa-receipt' },
    { to: '/home/cart', label: 'Cart', icon: 'fa-cart-shopping' },
    { to: '/home/location', label: 'Location', icon: 'fa-location-dot' },
    { to: '/home/payment', label: 'Payment', icon: 'fa-credit-card' },
  ];

  return (
    <div style={styles.root}>
      {/* Top Navbar */}
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>✳</span>
          <span style={styles.logoText}>DVSS</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
            >
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: 15 }} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.headerRight}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <i className="fa-solid fa-right-from-bracket" /> Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' },
  header: {
    background: 'white', borderBottom: '1px solid #E5E7EB',
    padding: '0 32px', height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { color: '#E8391D', fontSize: 20, fontWeight: 700 },
  logoText: { fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' },
  nav: { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '7px 16px', borderRadius: 50,
    textDecoration: 'none', fontSize: 14, fontWeight: 500,
    color: '#6B7280', transition: 'all 0.2s'
  },
  navLinkActive: { background: '#FFF0EE', color: '#E8391D' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#E8391D', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 15
  },
  logoutBtn: {
    background: 'none', border: '1.5px solid #E5E7EB',
    padding: '6px 14px', borderRadius: 50, fontSize: 13,
    fontWeight: 500, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6,
    cursor: 'pointer', transition: 'all 0.2s'
  },
  main: { flex: 1, padding: '28px 32px' }
};
