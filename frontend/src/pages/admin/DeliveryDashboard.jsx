import { useState, useEffect } from 'react';
import axios from 'axios';

const DEMO_ACTIVE = [
  { id: 4529, customer_name: 'Ravi Kumar', items_summary: '2x Margherita Pizza', total_amount: '25.98', status: 'incoming', delivery_address: 'Anna Salai, Chennai - 600002', payment_mode: 'upi', created_at: new Date(Date.now()-3*60000).toISOString(), rider: null },
  { id: 4531, customer_name: 'John Doe', items_summary: '1x Chicken Biryani, 2x Mango Lassi', total_amount: '21.47', status: 'preparing', delivery_address: 'Tidel Park, Taramani, Chennai', payment_mode: 'upi', created_at: new Date(Date.now()-8*60000).toISOString(), rider: 'Ramesh K.' },
  { id: 4530, customer_name: 'Emily Smith', items_summary: '1x Caesar Salad, 1x Cold Coffee', total_amount: '11.48', status: 'out_for_delivery', delivery_address: '15, T Nagar, Chennai - 600017', payment_mode: 'cash', created_at: new Date(Date.now()-15*60000).toISOString(), rider: 'Suresh M.' },
  { id: 4527, customer_name: 'Arjun Mehta', items_summary: '2x Chicken Wings, 1x BBQ Burger', total_amount: '30.97', status: 'preparing', delivery_address: 'OMR Road, Chennai - 600041', payment_mode: 'cash', created_at: new Date(Date.now()-22*60000).toISOString(), rider: 'Karthik R.' },
  { id: 4524, customer_name: 'Meera Pillai', items_summary: '3x Gulab Jamun, 1x Mango Lassi', total_amount: '17.46', status: 'incoming', delivery_address: 'Porur, Chennai - 600116', payment_mode: 'upi', created_at: new Date(Date.now()-5*60000).toISOString(), rider: null },
  { id: 4523, customer_name: 'Dev Sharma', items_summary: '1x Veg Fried Rice, 1x Paneer Tikka', total_amount: '19.48', status: 'out_for_delivery', delivery_address: 'Chromepet, Chennai - 600044', payment_mode: 'cash', created_at: new Date(Date.now()-30*60000).toISOString(), rider: 'Vijay S.' },
];

const RIDERS = ['Ramesh K.', 'Suresh M.', 'Karthik R.', 'Vijay S.', 'Mohan D.', 'Arun P.'];

const STATUS_CFG = {
  incoming:         { label: 'Incoming',         bg: '#DBEAFE', color: '#1D4ED8', icon: 'fa-inbox' },
  preparing:        { label: 'Preparing',         bg: '#FEF3C7', color: '#92400E', icon: 'fa-fire-burner' },
  out_for_delivery: { label: 'Out for Delivery',  bg: '#E0F2FE', color: '#0369A1', icon: 'fa-motorcycle' },
};

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState(DEMO_ACTIVE);
  const [toast, setToast] = useState({ msg: '', color: '#1A1D2E' });
  const [mapOrder, setMapOrder] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const showMsg = (msg, color = '#16A34A') => { setToast({ msg, color }); setTimeout(() => setToast({ msg: '' }), 2800); };

  // Live "clock" to show time updating
  useEffect(() => { const t = setInterval(() => setElapsed(e => e + 1), 30000); return () => clearInterval(t); }, []);

  const updateStatus = async (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o).filter(o => o.status !== 'delivered' && o.status !== 'cancelled'));
    showMsg(`✅ Order #${id} → ${status.replace('_', ' ')}`, '#16A34A');
    try { await axios.put(`/api/orders/${id}/status`, { status }); } catch {}
  };

  const assignRider = (id, rider) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, rider } : o));
    showMsg(`🛵 ${rider} assigned to Order #${id}`, '#2563EB');
  };

  const timeSince = iso => {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return (
    <div>
      {toast.msg && <div style={{ ...styles.toast, background: toast.color }}>{toast.msg}</div>}

      {/* Map Modal */}
      {mapOrder && (
        <div style={styles.overlay} onClick={() => setMapOrder(null)}>
          <div style={styles.mapModal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>📍 Order #{mapOrder.id} — Live Tracking</h3>
              <button style={styles.closeBtn} onClick={() => setMapOrder(null)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div style={styles.mapPlaceholder}>
              <div style={styles.mapBg}>
                {/* Fake map grid */}
                {Array.from({length:8}).map((_,i)=><div key={i} style={{position:'absolute',left:0,right:0,top:`${i*12.5}%`,borderBottom:'1px solid rgba(255,255,255,0.06)'}}/>)}
                {Array.from({length:8}).map((_,i)=><div key={i} style={{position:'absolute',top:0,bottom:0,left:`${i*12.5}%`,borderRight:'1px solid rgba(255,255,255,0.06)'}}/>)}
                {/* Route line */}
                <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
                  <polyline points="60,160 120,130 180,100 240,80 300,60" stroke="#22C55E" strokeWidth="3" fill="none" strokeDasharray="8,4" />
                </svg>
                {/* Restaurant pin */}
                <div style={{position:'absolute',left:50,top:145,background:'#E8391D',borderRadius:'50% 50% 50% 0',width:28,height:28,transform:'rotate(-45deg)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(232,57,29,0.5)'}}>
                  <i className="fa-solid fa-store" style={{transform:'rotate(45deg)',color:'white',fontSize:12}}/>
                </div>
                {/* Rider pin */}
                <div style={{position:'absolute',left:225,top:65,background:'#2563EB',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(37,99,235,0.5)',animation:'pulse 2s infinite'}}>
                  <i className="fa-solid fa-motorcycle" style={{color:'white',fontSize:14}}/>
                </div>
                {/* Customer pin */}
                <div style={{position:'absolute',left:290,top:45,background:'#16A34A',borderRadius:'50% 50% 50% 0',width:28,height:28,transform:'rotate(-45deg)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(22,163,74,0.5)'}}>
                  <i className="fa-solid fa-house" style={{transform:'rotate(45deg)',color:'white',fontSize:11}}/>
                </div>
                <div style={{position:'absolute',bottom:12,left:12,background:'rgba(0,0,0,0.6)',color:'white',fontSize:11,padding:'6px 10px',borderRadius:8,backdropFilter:'blur(4px)'}}>
                  🟢 Live • ETA: ~12 min
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:16,marginTop:14}}>
              <div style={styles.trackItem}><i className="fa-solid fa-store" style={{color:'#E8391D'}}/><div><p style={styles.trackLabel}>Restaurant</p><p style={styles.trackVal}>DVSS Kitchen, Chennai</p></div></div>
              <div style={styles.trackItem}><i className="fa-solid fa-motorcycle" style={{color:'#2563EB'}}/><div><p style={styles.trackLabel}>Rider</p><p style={styles.trackVal}>{mapOrder.rider || 'Assigning...'}</p></div></div>
              <div style={styles.trackItem}><i className="fa-solid fa-house" style={{color:'#16A34A'}}/><div><p style={styles.trackLabel}>Customer</p><p style={styles.trackVal}>{mapOrder.customer_name}</p></div></div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Delivery Dashboard</h1>
          <p style={styles.sub}>Live view of all active deliveries · Auto-refreshes every 30s</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={styles.liveBadge}><div style={styles.liveDot}/> LIVE</div>
          <button style={styles.refreshBtn} onClick={() => showMsg('🔄 Dashboard refreshed!', '#2563EB')}><i className="fa-solid fa-rotate-right" /> Refresh</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={styles.kpiRow}>
        {[
          { label: 'Incoming', key: 'incoming', icon: 'fa-inbox', color: '#1D4ED8', bg: '#EFF6FF' },
          { label: 'Preparing', key: 'preparing', icon: 'fa-fire-burner', color: '#D97706', bg: '#FFFBEB' },
          { label: 'Out for Delivery', key: 'out_for_delivery', icon: 'fa-motorcycle', color: '#0369A1', bg: '#E0F2FE' },
          { label: 'Riders Active', key: 'riders', icon: 'fa-people-group', color: '#7C3AED', bg: '#F5F3FF' },
        ].map(k => (
          <div key={k.key} className="card" style={{ padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, background: k.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`fa-solid ${k.icon}`} style={{ fontSize: 20, color: k.color }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>{k.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#1A1D2E' }}>{k.key === 'riders' ? RIDERS.length : (counts[k.key] || 0)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order cards */}
      <h3 style={styles.secTitle}>Active Orders <span style={{ fontSize: 13, fontWeight: 400, color: '#9CA3AF' }}>({orders.length} orders)</span></h3>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <i className="fa-solid fa-truck-fast" style={{ fontSize: 52, color: '#D1D5DB', display: 'block', textAlign: 'center', marginBottom: 16 }} />
          <p style={{ textAlign: 'center', color: '#9CA3AF' }}>No active deliveries. All orders are delivered!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {orders.map(o => {
            const cfg = STATUS_CFG[o.status] || { label: o.status, bg: '#F3F4F6', color: '#374151', icon: 'fa-circle' };
            return (
              <div key={o.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#1A1D2E' }}>#{o.id}</span>
                    <span style={{ ...styles.statusBadge, background: cfg.bg, color: cfg.color, marginLeft: 10 }}>
                      <i className={`fa-solid ${cfg.icon}`} style={{ marginRight: 4 }} />{cfg.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{timeSince(o.created_at)}</span>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}><i className="fa-solid fa-user" style={{ color: '#9CA3AF', width: 14 }} /><span style={{ fontWeight: 600 }}>{o.customer_name}</span></div>
                  <div style={styles.infoItem}><i className="fa-solid fa-dollar-sign" style={{ color: '#E8391D', width: 14 }} /><span style={{ fontWeight: 700, color: '#E8391D' }}>${parseFloat(o.total_amount).toFixed(2)}</span></div>
                  <div style={{ ...styles.infoItem, gridColumn: '1/-1' }}><i className="fa-solid fa-location-dot" style={{ color: '#E8391D', width: 14 }} /><span style={{ fontSize: 13, color: '#6B7280' }}>{o.delivery_address}</span></div>
                  <div style={{ ...styles.infoItem, gridColumn: '1/-1' }}><i className="fa-solid fa-utensils" style={{ color: '#9CA3AF', width: 14 }} /><span style={{ fontSize: 13, color: '#6B7280' }}>{o.items_summary}</span></div>
                </div>

                {/* Assign rider */}
                <div style={{ margin: '12px 0', padding: '10px 12px', background: '#F9FAFB', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-motorcycle" style={{ color: o.rider ? '#16A34A' : '#9CA3AF', fontSize: 14 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: o.rider ? '#166534' : '#9CA3AF', flex: 1 }}>
                    {o.rider ? `Rider: ${o.rider}` : 'No rider assigned'}
                  </span>
                  <select defaultValue="" onChange={e => { if (e.target.value) assignRider(o.id, e.target.value); }} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: 'white', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Assign rider</option>
                    {RIDERS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={styles.trackBtn} onClick={() => setMapOrder(o)}>
                    <i className="fa-solid fa-map-location-dot" /> Track
                  </button>
                  {o.status === 'incoming' && (
                    <button style={{ ...styles.actionBtn, background: '#FEF3C7', color: '#92400E' }} onClick={() => updateStatus(o.id, 'preparing')}>
                      <i className="fa-solid fa-fire-burner" /> Start Preparing
                    </button>
                  )}
                  {o.status === 'preparing' && (
                    <button style={{ ...styles.actionBtn, background: '#E0F2FE', color: '#0369A1' }} onClick={() => updateStatus(o.id, 'out_for_delivery')}>
                      <i className="fa-solid fa-motorcycle" /> Dispatch Rider
                    </button>
                  )}
                  {o.status === 'out_for_delivery' && (
                    <button style={{ ...styles.actionBtn, background: '#DCFCE7', color: '#166534' }} onClick={() => updateStatus(o.id, 'delivered')}>
                      <i className="fa-solid fa-circle-check" /> Mark Delivered
                    </button>
                  )}
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
  toast: { position: 'fixed', top: 20, right: 24, color: 'white', padding: '13px 22px', borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mapModal: { background: 'white', borderRadius: 20, padding: '24px', width: 520, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  mapPlaceholder: { borderRadius: 14, overflow: 'hidden', height: 200 },
  mapBg: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #1A1D2E 0%, #2D3250 100%)', position: 'relative' },
  closeBtn: { width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#6B7280' },
  trackItem: { flex: 1, display: 'flex', gap: 8, alignItems: 'center' },
  trackLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: 600 },
  trackVal: { fontSize: 13, fontWeight: 600, color: '#1A1D2E' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E' },
  sub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 6, background: '#DCFCE7', color: '#166534', padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 0 2px #BBF7D0' },
  refreshBtn: { background: 'white', border: '1.5px solid #E5E7EB', padding: '7px 16px', borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  secTitle: { fontSize: 16, fontWeight: 700, color: '#1A1D2E', marginBottom: 16 },
  empty: { padding: '60px 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 600 },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 },
  infoItem: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#374151' },
  trackBtn: { padding: '8px 14px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#374151' },
  actionBtn: { flex: 1, padding: '8px 12px', borderRadius: 50, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
};
