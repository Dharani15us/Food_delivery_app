import { useState } from 'react';
import axios from 'axios';

const STATUSES = ['incoming','preparing','out_for_delivery','delivered','cancelled'];
const STATUS_META = {
  incoming:         { label: 'Incoming',         cls: 'badge-blue',  icon: 'fa-inbox' },
  preparing:        { label: 'Preparing',         cls: 'badge-amber', icon: 'fa-fire-burner' },
  out_for_delivery: { label: 'Out for Delivery',  cls: 'badge-blue',  icon: 'fa-motorcycle' },
  delivered:        { label: 'Delivered',         cls: 'badge-green', icon: 'fa-circle-check' },
  cancelled:        { label: 'Cancelled',         cls: 'badge-red',   icon: 'fa-ban' },
};

const DEMO_ORDERS = [
  { id: 4532, customer_name: 'Alice Freeman',  items_summary: '2x Butter Chicken, 1x Naan',           total_amount: '34.50', status: 'delivered',        payment_mode: 'card', delivery_address: '42, Anna Nagar, Chennai', created_at: new Date(Date.now()-2*60000).toISOString() },
  { id: 4531, customer_name: 'John Doe',       items_summary: '1x Chicken Biryani, 2x Mango Lassi',   total_amount: '21.47', status: 'preparing',         payment_mode: 'upi',  delivery_address: 'Tidel Park, Taramani', created_at: new Date(Date.now()-8*60000).toISOString() },
  { id: 4530, customer_name: 'Emily Smith',    items_summary: '1x Caesar Salad, 1x Cold Coffee',      total_amount: '11.48', status: 'out_for_delivery',  payment_mode: 'cash', delivery_address: '15, T Nagar, Chennai', created_at: new Date(Date.now()-15*60000).toISOString() },
  { id: 4529, customer_name: 'Ravi Kumar',     items_summary: '2x Margherita Pizza',                  total_amount: '25.98', status: 'incoming',          payment_mode: 'upi',  delivery_address: 'Anna Salai, Chennai', created_at: new Date(Date.now()-3*60000).toISOString() },
  { id: 4528, customer_name: 'Priya Nair',     items_summary: '1x Masala Dosa, 1x Idli Sambar',      total_amount: '12.98', status: 'delivered',         payment_mode: 'card', delivery_address: 'Velachery, Chennai', created_at: new Date(Date.now()-45*60000).toISOString() },
  { id: 4527, customer_name: 'Arjun Mehta',    items_summary: '2x Chicken Wings, 1x BBQ Burger',     total_amount: '30.97', status: 'preparing',         payment_mode: 'cash', delivery_address: 'OMR Road, Chennai', created_at: new Date(Date.now()-22*60000).toISOString() },
  { id: 4526, customer_name: 'Sneha Reddy',    items_summary: '1x Dal Makhani, 2x Butter Naan',      total_amount: '18.47', status: 'cancelled',         payment_mode: 'upi',  delivery_address: 'Adyar, Chennai', created_at: new Date(Date.now()-60*60000).toISOString() },
  { id: 4525, customer_name: 'Kiran Bose',     items_summary: '1x Chicken Shawarma, 1x Cold Coffee', total_amount: '13.48', status: 'delivered',         payment_mode: 'card', delivery_address: 'Mylapore, Chennai', created_at: new Date(Date.now()-90*60000).toISOString() },
  { id: 4524, customer_name: 'Meera Pillai',   items_summary: '3x Gulab Jamun, 1x Mango Lassi',      total_amount: '17.46', status: 'incoming',          payment_mode: 'upi',  delivery_address: 'Porur, Chennai', created_at: new Date(Date.now()-5*60000).toISOString() },
  { id: 4523, customer_name: 'Dev Sharma',     items_summary: '1x Veg Fried Rice, 1x Paneer Tikka',  total_amount: '19.48', status: 'out_for_delivery',  payment_mode: 'cash', delivery_address: 'Chromepet, Chennai', created_at: new Date(Date.now()-30*60000).toISOString() },
];

export default function OrderManagement() {
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ msg: '', color: '#1A1D2E' });
  const [selected, setSelected] = useState(null); // order detail modal
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const showMsg = (msg, color = '#16A34A') => { setToast({ msg, color }); setTimeout(() => setToast({ msg: '' }), 2500); };

  const updateStatus = async (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected(o => ({ ...o, status }));
    showMsg(`✅ Order #${id} → ${STATUS_META[status].label}`, '#16A34A');
    try { await axios.put(`/api/orders/${id}/status`, { status }); } catch {}
  };

  const refresh = () => {
    setLastRefresh(new Date());
    showMsg('🔄 Orders refreshed!', '#2563EB');
  };

  let filtered = orders;
  if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(o =>
      o.customer_name.toLowerCase().includes(q) ||
      String(o.id).includes(q) ||
      o.items_summary.toLowerCase().includes(q)
    );
  }

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  const timeSince = (iso) => {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div>
      {toast.msg && <div style={{ ...styles.toast, background: toast.color }}>{toast.msg}</div>}

      {/* Order Detail Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.detailModal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Order #{selected.id}</h3>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Customer', value: selected.customer_name, icon: 'fa-user' },
                { label: 'Payment', value: selected.payment_mode?.toUpperCase(), icon: 'fa-wallet' },
                { label: 'Amount', value: `$${parseFloat(selected.total_amount).toFixed(2)}`, icon: 'fa-dollar-sign' },
                { label: 'Time', value: timeSince(selected.created_at), icon: 'fa-clock' },
              ].map(f => (
                <div key={f.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>{f.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1D2E' }}><i className={`fa-solid ${f.icon}`} style={{ color: '#E8391D', marginRight: 7 }} />{f.value}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 6 }}>ITEMS ORDERED</p>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}><i className="fa-solid fa-utensils" style={{ color: '#E8391D', marginRight: 8 }} />{selected.items_summary}</p>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 6 }}>DELIVERY ADDRESS</p>
              <p style={{ fontSize: 14, color: '#374151' }}><i className="fa-solid fa-location-dot" style={{ color: '#E8391D', marginRight: 8 }} />{selected.delivery_address}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>UPDATE STATUS</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s} style={{ padding: '8px 14px', borderRadius: 50, border: `1.5px solid ${selected.status === s ? '#E8391D' : '#E5E7EB'}`, background: selected.status === s ? '#E8391D' : 'white', color: selected.status === s ? 'white' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => updateStatus(selected.id, s)}>
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Order Management</h1>
          <p style={styles.sub}>Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button style={styles.refreshBtn} onClick={refresh}><i className="fa-solid fa-rotate-right" /> Refresh</button>
      </div>

      {/* Status filter cards */}
      <div style={styles.statusCards}>
        {[{ key: 'all', label: 'All', icon: 'fa-list', color: '#374151', bg: '#F3F4F6' }, ...STATUSES.map(s => ({ key: s, ...STATUS_META[s], color: s === 'incoming' ? '#1D4ED8' : s === 'preparing' ? '#92400E' : s === 'out_for_delivery' ? '#0369A1' : s === 'delivered' ? '#166534' : '#991B1B', bg: s === 'incoming' ? '#DBEAFE' : s === 'preparing' ? '#FEF3C7' : s === 'out_for_delivery' ? '#E0F2FE' : s === 'delivered' ? '#DCFCE7' : '#FEE2E2' }))].map(s => (
          <button key={s.key} style={{ ...styles.statusCard, background: statusFilter === s.key ? s.color : s.bg, color: statusFilter === s.key ? 'white' : s.color }} onClick={() => setStatusFilter(s.key)}>
            <i className={`fa-solid ${s.icon}`} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{s.key === 'all' ? orders.length : (counts[s.key] || 0)}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, position: 'relative', maxWidth: 340 }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13 }} />
        <input placeholder="Search customer, order ID, dish..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, borderRadius: 50, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', width: '100%', padding: '9px 16px 9px 40px' }} />
      </div>

      {/* Orders table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Order ID','Customer','Items','Amount','Payment','Time','Status','Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No orders found</td></tr>
            ) : filtered.map(o => {
              const s = STATUS_META[o.status] || { label: o.status, cls: 'badge-gray', icon: 'fa-circle' };
              return (
                <tr key={o.id} style={{ ...styles.tr, cursor: 'pointer' }} onClick={() => setSelected(o)}>
                  <td style={styles.td}><strong style={{ color: '#E8391D' }}>#{o.id}</strong></td>
                  <td style={styles.td}><span style={{ fontWeight: 600 }}>{o.customer_name}</span></td>
                  <td style={{ ...styles.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6B7280', fontSize: 13 }}>{o.items_summary}</td>
                  <td style={styles.td}><strong>${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                  <td style={styles.td}><span className="badge badge-gray">{o.payment_mode?.toUpperCase()}</span></td>
                  <td style={{ ...styles.td, fontSize: 12, color: '#9CA3AF' }}>{timeSince(o.created_at)}</td>
                  <td style={styles.td}><span className={`badge ${s.cls}`}><i className={`fa-solid ${s.icon}`} style={{ marginRight: 4 }} />{s.label}</span></td>
                  <td style={styles.td} onClick={e => e.stopPropagation()}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={styles.statusSelect}>
                      {STATUSES.map(st => <option key={st} value={st}>{STATUS_META[st].label}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>💡 Click any row to view full order details</p>
    </div>
  );
}

const styles = {
  toast: { position: 'fixed', top: 20, right: 24, color: 'white', padding: '13px 22px', borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  detailModal: { background: 'white', borderRadius: 20, padding: '28px', width: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
  closeBtn: { width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#6B7280' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E' },
  sub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  refreshBtn: { background: 'white', border: '1.5px solid #E5E7EB', padding: '9px 18px', borderRadius: 50, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  statusCards: { display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' },
  statusCard: { flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '12px 10px', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 12px', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #E5E7EB' },
  tr: { borderBottom: '1px solid #F9FAFB', transition: 'background 0.15s' },
  td: { padding: '12px 12px', fontSize: 14, color: '#374151' },
  statusSelect: { padding: '5px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 12, outline: 'none', background: 'white', cursor: 'pointer' },
};
