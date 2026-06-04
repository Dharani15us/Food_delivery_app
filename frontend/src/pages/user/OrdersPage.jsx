import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_STYLES = {
  incoming:          { label: 'Incoming',          cls: 'badge-blue',  icon: 'fa-inbox' },
  preparing:         { label: 'Preparing',         cls: 'badge-amber', icon: 'fa-fire-burner' },
  out_for_delivery:  { label: 'Out for Delivery',  cls: 'badge-blue',  icon: 'fa-motorcycle' },
  delivered:         { label: 'Delivered',         cls: 'badge-green', icon: 'fa-circle-check' },
  cancelled:         { label: 'Cancelled',         cls: 'badge-red',   icon: 'fa-ban' },
};

// Default sample orders shown when not connected to backend
const DEFAULT_ORDERS = [
  { id: 4532, items_summary: '2x Margherita Pizza, 1x Chicken Wings', total_amount: '34.50', status: 'delivered', delivery_address: '42, Anna Nagar, Chennai', payment_mode: 'card', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 4531, items_summary: '1x Chicken Biryani, 2x Mango Lassi', total_amount: '21.47', status: 'preparing', delivery_address: 'Tidel Park, Taramani, Chennai', payment_mode: 'upi', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 4530, items_summary: '1x Caesar Salad, 1x Cold Coffee', total_amount: '11.48', status: 'delivered', delivery_address: '15, T Nagar, Chennai', payment_mode: 'cash', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 4529, items_summary: '1x Butter Chicken, 1x Dal Makhani, 2x Gulab Jamun', total_amount: '34.46', status: 'out_for_delivery', delivery_address: '42, Anna Nagar, Chennai', payment_mode: 'card', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 4528, items_summary: '2x Chicken Burger, 1x BBQ Beef Burger', total_amount: '31.97', status: 'delivered', delivery_address: 'Tidel Park, Taramani, Chennai', payment_mode: 'upi', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 4527, items_summary: '1x Masala Dosa, 1x Idli Sambar, 2x Mango Lassi', total_amount: '20.96', status: 'incoming', delivery_address: '15, T Nagar, Chennai', payment_mode: 'cash', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [filtered, setFiltered] = useState(DEFAULT_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/orders/my');
        if (data && data.length > 0) {
          // Deduplicate by order id before setting
          const seen = new Set();
          const unique = data.filter(o => {
            if (seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
          });
          setOrders(unique);
          setFiltered(unique);
          setFromApi(true);
        }
        // else keep defaults
      } catch {
        // keep defaults silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let res = orders;
    if (statusFilter !== 'all') res = res.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(o =>
        o.items_summary?.toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        o.status?.includes(q) ||
        o.delivery_address?.toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [search, statusFilter, orders]);

  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>My Orders</h2>
          <p style={styles.sub}>
            {fromApi ? `${orders.length} orders found` : 'Showing sample orders — connect backend for your real orders'}
          </p>
        </div>
        <div style={styles.searchWrap}>
          <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Search by dish, order ID, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status summary cards */}
      <div style={styles.statusCards}>
        {[
          { key: 'all',            label: 'All Orders',      icon: 'fa-list',          bg: '#F3F4F6', color: '#374151' },
          { key: 'incoming',       label: 'Incoming',        icon: 'fa-inbox',         bg: '#DBEAFE', color: '#1D4ED8' },
          { key: 'preparing',      label: 'Preparing',       icon: 'fa-fire-burner',   bg: '#FEF3C7', color: '#92400E' },
          { key: 'out_for_delivery', label: 'On the Way',    icon: 'fa-motorcycle',    bg: '#E0F2FE', color: '#0369A1' },
          { key: 'delivered',      label: 'Delivered',       icon: 'fa-circle-check',  bg: '#DCFCE7', color: '#166534' },
        ].map(s => (
          <button
            key={s.key}
            style={{ ...styles.statusCard, background: statusFilter === s.key ? s.color : s.bg, color: statusFilter === s.key ? 'white' : s.color }}
            onClick={() => setStatusFilter(s.key)}
          >
            <i className={`fa-solid ${s.icon}`} style={{ fontSize: 16, marginBottom: 4 }} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              {s.key === 'all' ? orders.length : (statusCounts[s.key] || 0)}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="loading-spinner" />
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <i className="fa-solid fa-receipt" style={{ fontSize: 48, color: '#D1D5DB', display: 'block', textAlign: 'center', marginBottom: 16 }} />
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 15 }}>No orders match your filter.</p>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button className="btn-secondary" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear filters</button>
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map(order => {
            const s = STATUS_STYLES[order.status] || { label: order.status, cls: 'badge-gray', icon: 'fa-circle' };
            const date = new Date(order.created_at);
            return (
              <div key={order.id} className="card" style={styles.orderCard}>
                {/* Top row */}
                <div style={styles.cardTop}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={styles.orderIcon}>
                      <i className={`fa-solid ${s.icon}`} style={{ color: '#E8391D', fontSize: 16 }} />
                    </div>
                    <div>
                      <span style={styles.orderId}>Order #{order.id}</span>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${s.cls}`} style={{ padding: '5px 12px', fontSize: 12 }}>
                    <i className={`fa-solid ${s.icon}`} style={{ marginRight: 5 }} />{s.label}
                  </span>
                </div>

                {/* Items */}
                <div style={styles.cardMid}>
                  <i className="fa-solid fa-utensils" style={{ color: '#E8391D', marginRight: 10, fontSize: 14 }} />
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{order.items_summary || 'No items'}</span>
                </div>

                {/* Footer */}
                <div style={styles.cardFooter}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaItem}>
                      <i className="fa-solid fa-location-dot" style={{ color: '#E8391D' }} />
                      {order.delivery_address || 'Not specified'}
                    </span>
                    <span style={styles.metaItem}>
                      <i className="fa-solid fa-wallet" style={{ color: '#9CA3AF' }} />
                      {order.payment_mode?.toUpperCase() || 'CASH'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={styles.totalAmt}>${parseFloat(order.total_amount).toFixed(2)}</span>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>Total</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E' },
  sub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  searchWrap: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 14 },
  searchInput: { padding: '10px 16px 10px 40px', borderRadius: 50, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', width: 300 },
  statusCards: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  statusCard: { flex: 1, minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '14px 12px', borderRadius: 14, border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  orderCard: { padding: '20px 24px' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  orderIcon: { width: 44, height: 44, background: '#FFF0EE', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  orderId: { fontSize: 16, fontWeight: 700, color: '#1A1D2E' },
  cardMid: { display: 'flex', alignItems: 'flex-start', padding: '14px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', marginBottom: 14 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  metaRow: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  metaItem: { fontSize: 13, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6 },
  totalAmt: { fontSize: 22, fontWeight: 700, color: '#E8391D' },
  empty: { padding: '60px 20px' },
};
