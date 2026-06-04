import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import InventoryPage from './admin/InventoryPage';
import SalesAnalytics from './admin/SalesAnalytics';
import OrderManagement from './admin/OrderManagement';
import ChatAdmin from './admin/ChatAdmin';
import DeliveryDashboard from './admin/DeliveryDashboard';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge-high', end: true },
  { to: '/admin/inventory', label: 'Inventory Management', icon: 'fa-boxes-stacked' },
  { to: '/admin/analytics', label: 'Sales Analytics', icon: 'fa-chart-line' },
  { to: '/admin/orders', label: 'Order Management', icon: 'fa-bag-shopping' },
  { to: '/admin/chat', label: 'Chat', icon: 'fa-comments' },
  { to: '/admin/delivery', label: 'Delivery Dashboard', icon: 'fa-motorcycle' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}><i className="fa-solid fa-utensils" style={{ color: '#22C55E', fontSize: 18 }} /></div>
            <div>
              <div style={styles.brandName}>EatsAdmin</div>
              <div style={styles.brandSub}>Restaurant Panel</div>
            </div>
          </div>
          <nav style={styles.nav}>
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
              >
                <i className={`fa-solid ${item.icon}`} style={styles.navIcon} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={styles.sidebarBottom}>
          <div style={styles.statusDot} />
          <span style={styles.statusText}>All systems operational</span>
        </div>
      </aside>

      {/* Main area */}
      <div style={styles.main}>
        {/* Top bar */}
        <header style={styles.header}>
          <input placeholder="Search pages..." style={styles.headerSearch} />
          <div style={styles.headerRight}>
            <div style={styles.notifBadge}><i className="fa-solid fa-bell" style={{ fontSize: 16 }} /><span style={styles.badge}>3</span></div>
            <i className="fa-solid fa-gear" style={{ fontSize: 18, color: '#9CA3AF', cursor: 'pointer' }} />
            <div style={styles.userChip}>
              <div style={styles.userAvatar}>{user?.name?.[0]}</div>
              <div>
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userRole}>Super Admin</div>
              </div>
            </div>
            <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/auth'); }}>
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/analytics" element={<SalesAnalytics />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/chat" element={<ChatAdmin />} />
            <Route path="/delivery" element={<DeliveryDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: '#F9FAFB' },
  sidebar: {
    width: 260, background: 'white', borderRight: '1px solid #E5E7EB',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    position: 'sticky', top: 0, height: '100vh', flexShrink: 0
  },
  sidebarTop: { padding: '24px 0' },
  brand: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 24px', borderBottom: '1px solid #F3F4F6' },
  brandIcon: { width: 42, height: 42, background: '#F0FDF4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName: { fontWeight: 700, fontSize: 16, color: '#1A1D2E' },
  brandSub: { fontSize: 12, color: '#9CA3AF' },
  nav: { padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500, color: '#6B7280', transition: 'all 0.15s' },
  navLinkActive: { background: '#F0FDF4', color: '#16A34A' },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  sidebarBottom: { padding: '16px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 },
  statusText: { fontSize: 12, color: '#6B7280' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, position: 'sticky', top: 0, zIndex: 10 },
  headerSearch: { padding: '8px 16px 8px 36px', borderRadius: 50, border: '1px solid #E5E7EB', fontSize: 14, width: 280, outline: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%239CA3AF' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.44.975a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: '12px center' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  notifBadge: { position: 'relative', cursor: 'pointer', color: '#6B7280' },
  badge: { position: 'absolute', top: -8, right: -8, background: '#E8391D', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 50, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userChip: { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#E8391D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  userName: { fontSize: 14, fontWeight: 600, color: '#1A1D2E' },
  userRole: { fontSize: 11, color: '#9CA3AF' },
  logoutBtn: { background: 'none', border: 'none', color: '#9CA3AF', fontSize: 16, cursor: 'pointer', padding: 4 },
  content: { flex: 1, padding: '28px 32px', overflowY: 'auto' }
};
