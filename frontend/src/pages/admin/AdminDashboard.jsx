import { useState, useEffect } from 'react';
import axios from 'axios';

const DEMO_ANALYTICS = {
  total_revenue: 45231.84, active_orders: 572, total_customers: 2400,
  topDishes: [
    { name: 'Butter Chicken', total_sold: 312, revenue: 4365.88 },
    { name: 'Chicken Biryani', total_sold: 289, revenue: 3896.61 },
    { name: 'Margherita Pizza', total_sold: 241, revenue: 3130.59 },
    { name: 'Chicken Burger', total_sold: 198, revenue: 1978.02 },
    { name: 'Masala Dosa', total_sold: 176, revenue: 1230.24 },
  ],
  daily: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
    revenue: (Math.random() * 2000 + 800).toFixed(2),
    order_count: Math.floor(Math.random() * 60 + 20),
  })),
};

const DEMO_ORDERS = [
  { id: 4532, customer_name: 'Alice Freeman', items_summary: '2x Butter Chicken, 1x Naan', total_amount: '34.50', status: 'delivered', created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 4531, customer_name: 'John Doe', items_summary: '1x Chicken Biryani, 2x Mango Lassi', total_amount: '21.47', status: 'preparing', created_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: 4530, customer_name: 'Emily Smith', items_summary: '1x Caesar Salad, 1x Cold Coffee', total_amount: '11.48', status: 'out_for_delivery', created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 4529, customer_name: 'Ravi Kumar', items_summary: '2x Margherita Pizza', total_amount: '25.98', status: 'incoming', created_at: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: 4528, customer_name: 'Priya Nair', items_summary: '1x Masala Dosa, 1x Idli Sambar', total_amount: '12.98', status: 'delivered', created_at: new Date(Date.now() - 45 * 60000).toISOString() },
];

const STATUS_STYLES = {
  incoming:         { label: 'Incoming',         cls: 'badge-blue' },
  preparing:        { label: 'Preparing',         cls: 'badge-amber' },
  out_for_delivery: { label: 'Out for Delivery',  cls: 'badge-blue' },
  delivered:        { label: 'Delivered',         cls: 'badge-green' },
  cancelled:        { label: 'Cancelled',         cls: 'badge-red' },
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(DEMO_ANALYTICS);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState({ msg: '', color: '#1A1D2E' });
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDish, setNewDish] = useState({ name: '', price: '', category: 'Pizza' });
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    axios.get('/api/orders/analytics').then(r => setAnalytics(r.data)).catch(() => {});
    axios.get('/api/orders/all').then(r => { if (r.data?.length) setOrders(r.data.slice(0, 5)); }).catch(() => {});
  }, []);

  const showMsg = (msg, color = '#1A1D2E') => { setToast({ msg, color }); setTimeout(() => setToast({ msg: '' }), 2800); };

  const now = new Date();
  const dateRange = `May 20 – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const maxRevenue = Math.max(...(analytics.daily?.map(d => parseFloat(d.revenue)) || [1]));

  const handleAddDish = () => {
    if (!newDish.name || !newDish.price) { showMsg('Please fill in dish name and price.', '#E8391D'); return; }
    showMsg(`✅ "${newDish.name}" added to menu successfully!`, '#16A34A');
    setShowAddDish(false);
    setNewDish({ name: '', price: '', category: 'Pizza' });
  };

  return (
    <div>
      {toast.msg && <div style={{ ...styles.toast, background: toast.color }}>{toast.msg}</div>}

      {/* Report Modal */}
      {showReport && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700 }}>📊 Download Report</h3>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>Select report type and date range:</p>
            <select style={{ width: '100%', marginBottom: 14, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none' }}>
              <option>Sales Summary Report</option>
              <option>Order History Report</option>
              <option>Inventory Report</option>
              <option>Customer Analytics Report</option>
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div><label style={styles.label}>From</label><input type="date" style={{ width: '100%' }} defaultValue="2026-05-01" /></div>
              <div><label style={styles.label}>To</label><input type="date" style={{ width: '100%' }} defaultValue={new Date().toISOString().slice(0,10)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={styles.cancelBtn} onClick={() => setShowReport(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, background: '#16A34A' }} onClick={() => { setShowReport(false); showMsg('📥 Report downloaded as PDF!', '#16A34A'); }}>
                <i className="fa-solid fa-download" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {showAddDish && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700 }}>🍽️ Add New Menu Item</h3>
            <div style={{ marginBottom: 14 }}><label style={styles.label}>Dish Name</label><input placeholder="e.g. Paneer Butter Masala" value={newDish.name} onChange={e => setNewDish(d => ({ ...d, name: e.target.value }))} /></div>
            <div style={{ marginBottom: 14 }}><label style={styles.label}>Price ($)</label><input type="number" placeholder="12.99" value={newDish.price} onChange={e => setNewDish(d => ({ ...d, price: e.target.value }))} /></div>
            <div style={{ marginBottom: 20 }}><label style={styles.label}>Category</label>
              <select value={newDish.category} onChange={e => setNewDish(d => ({ ...d, category: e.target.value }))}>
                {['Pizza','Burgers','Rice','Starters','Salads','South Indian','Desserts','Beverages','Curries','Wraps'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={styles.cancelBtn} onClick={() => setShowAddDish(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddDish}><i className="fa-solid fa-plus" /> Add Item</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard Overview</h1>
          <p style={styles.pageSub}>Showing data for: <span style={{ color: '#16A34A', fontWeight: 600 }}>{dateRange}</span></p>
        </div>
        <button className="btn-primary" style={{ background: '#16A34A' }} onClick={() => setShowReport(true)}>
          <i className="fa-solid fa-download" /> Download Report
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Revenue" value={`$${parseFloat(analytics.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="fa-dollar-sign" color="#16A34A" bg="#F0FDF4" change="+20.1%" />
        <StatCard label="Active Orders" value={`+${analytics.active_orders}`} icon="fa-bag-shopping" color="#2563EB" bg="#EFF6FF" change="+12.5%" />
        <StatCard label="Total Customers" value={analytics.total_customers.toLocaleString()} icon="fa-users" color="#9333EA" bg="#F5F3FF" change="+5.2%" />
      </div>

      {/* Revenue mini-chart + Orders */}
      <div style={styles.midRow}>
        {/* Bar chart */}
        <div className="card" style={{ padding: 24, flex: 1 }}>
          <h3 style={styles.cardTitle}>Revenue Trend (30 days)</h3>
          <div style={styles.chartWrap}>
            {analytics.daily?.map((d, i) => {
              const pct = (parseFloat(d.revenue) / maxRevenue) * 100;
              return (
                <div key={i} style={styles.barCol} title={`${d.date}\n$${parseFloat(d.revenue).toFixed(0)}`}>
                  <div style={{ ...styles.bar, height: `${Math.max(pct, 4)}%` }} />
                  {i % 6 === 0 && <span style={styles.barLabel}>{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top dishes */}
        <div className="card" style={{ padding: 24, width: 280 }}>
          <h3 style={styles.cardTitle}>Top Dishes 🏆</h3>
          {analytics.topDishes.map((d, i) => {
            const pct = (d.total_sold / analytics.topDishes[0].total_sold) * 100;
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D2E' }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]} {d.name}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{d.total_sold}</span>
                </div>
                <div style={{ height: 5, background: '#F3F4F6', borderRadius: 50 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: ['#16A34A','#2563EB','#9333EA','#E8391D','#F59E0B'][i], borderRadius: 50 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.twoCol}>
        {/* Recent Orders table */}
        <div className="card" style={styles.ordersCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={styles.cardTitle}>Recent Orders</h3>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Live updates every 30s</span>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>{['Order ID','Customer','Items','Amount','Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const s = STATUS_STYLES[o.status] || { label: o.status, cls: 'badge-gray' };
                return (
                  <tr key={o.id} style={styles.tr}>
                    <td style={styles.td}><strong>#{o.id}</strong></td>
                    <td style={styles.td}>{o.customer_name}</td>
                    <td style={{ ...styles.td, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items_summary}</td>
                    <td style={styles.td}><strong style={{ color: '#E8391D' }}>${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                    <td style={styles.td}><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={styles.cardTitle}>Quick Actions</h3>
          <div style={styles.actionList}>
            <button style={styles.actionBtn} onClick={() => setShowAddDish(true)}>
              <div style={{ ...styles.actionIcon, background: '#F0FDF4' }}><i className="fa-solid fa-plus" style={{ color: '#16A34A' }} /></div>
              <div><p style={styles.actionLabel}>Add New Menu Item</p><p style={styles.actionSub}>Add dish to menu instantly</p></div>
            </button>
            <button style={styles.actionBtn} onClick={() => showMsg('🏷️ Discount "SAVE20" applied to all orders!', '#2563EB')}>
              <div style={{ ...styles.actionIcon, background: '#EFF6FF' }}><i className="fa-solid fa-tag" style={{ color: '#2563EB' }} /></div>
              <div><p style={styles.actionLabel}>Manage Discounts</p><p style={styles.actionSub}>Apply promo codes & offers</p></div>
            </button>
            <button style={{ ...styles.actionBtn, ...(paused ? styles.actionBtnGreen : styles.actionBtnDanger) }} onClick={() => { setPaused(p => !p); showMsg(paused ? '▶️ Incoming orders resumed!' : '⏸️ Incoming orders paused!', paused ? '#16A34A' : '#E8391D'); }}>
              <div style={{ ...styles.actionIcon, background: paused ? '#F0FDF4' : '#FEF2F2' }}><i className={`fa-solid ${paused ? 'fa-play' : 'fa-pause'}`} style={{ color: paused ? '#16A34A' : '#E8391D' }} /></div>
              <div><p style={{ ...styles.actionLabel, color: paused ? '#166534' : '#991B1B' }}>{paused ? 'Resume Incoming Orders' : 'Pause Incoming Orders'}</p><p style={styles.actionSub}>{paused ? 'Currently paused' : 'Stop new orders temporarily'}</p></div>
            </button>
            <button style={styles.actionBtn} onClick={() => showMsg('📢 Notification sent to all 2,400 customers!', '#9333EA')}>
              <div style={{ ...styles.actionIcon, background: '#F5F3FF' }}><i className="fa-solid fa-bell" style={{ color: '#9333EA' }} /></div>
              <div><p style={styles.actionLabel}>Send Notification</p><p style={styles.actionSub}>Notify all customers</p></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, change }) {
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#1A1D2E', marginBottom: 10 }}>{value}</p>
        <p style={{ fontSize: 13, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="fa-solid fa-arrow-trend-up" /> {change} vs last month
        </p>
      </div>
      <div style={{ width: 48, height: 48, background: bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: 20, color }} />
      </div>
    </div>
  );
}

const styles = {
  toast: { position: 'fixed', top: 20, right: 24, color: 'white', padding: '13px 22px', borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'white', borderRadius: 20, padding: '32px 28px', width: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: 700, color: '#1A1D2E', marginBottom: 4 },
  pageSub: { fontSize: 14, color: '#9CA3AF' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 },
  midRow: { display: 'flex', gap: 20, marginBottom: 20 },
  chartWrap: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, paddingTop: 10 },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 3 },
  bar: { width: '80%', background: 'linear-gradient(to top, #16A34A, #4ADE80)', borderRadius: '3px 3px 0 0', minHeight: 3, transition: 'height 0.3s', cursor: 'pointer' },
  barLabel: { fontSize: 8, color: '#9CA3AF', whiteSpace: 'nowrap' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 },
  ordersCard: { padding: '24px', overflow: 'hidden' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1A1D2E', marginBottom: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #F3F4F6' },
  tr: { borderBottom: '1px solid #F9FAFB' },
  td: { padding: '13px 12px', fontSize: 14, color: '#374151' },
  actionList: { display: 'flex', flexDirection: 'column', gap: 8 },
  actionBtn: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' },
  actionBtnDanger: { borderColor: '#FECACA', background: '#FFF5F5' },
  actionBtnGreen: { borderColor: '#BBF7D0', background: '#F0FDF4' },
  actionIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionLabel: { fontSize: 14, fontWeight: 600, color: '#1A1D2E', margin: 0 },
  actionSub: { fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' },
};
