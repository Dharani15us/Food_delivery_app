import { useState } from 'react';

const DAILY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  revenue: parseFloat((Math.random() * 2200 + 600).toFixed(2)),
  orders: Math.floor(Math.random() * 70 + 15),
}));

const TOP_DISHES = [
  { name: 'Butter Chicken', sold: 312, revenue: 4365.88, category: 'Curries' },
  { name: 'Chicken Biryani', sold: 289, revenue: 3896.61, category: 'Rice' },
  { name: 'Margherita Pizza', sold: 241, revenue: 3130.59, category: 'Pizza' },
  { name: 'Chicken Burger', sold: 198, revenue: 1978.02, category: 'Burgers' },
  { name: 'Masala Dosa', sold: 176, revenue: 1230.24, category: 'South Indian' },
];

const CATEGORY_DATA = [
  { name: 'Curries', revenue: 8240, orders: 412, color: '#E8391D' },
  { name: 'Rice', revenue: 6180, orders: 389, color: '#F59E0B' },
  { name: 'Pizza', revenue: 5920, orders: 341, color: '#8B5CF6' },
  { name: 'Burgers', revenue: 4100, orders: 298, color: '#06B6D4' },
  { name: 'South Indian', revenue: 2840, orders: 256, color: '#16A34A' },
  { name: 'Beverages', revenue: 1930, orders: 422, color: '#EC4899' },
  { name: 'Starters', revenue: 2260, orders: 187, color: '#0EA5E9' },
  { name: 'Desserts', revenue: 1480, orders: 164, color: '#F97316' },
];

const STATUS_COUNTS = { incoming: 48, preparing: 67, out_for_delivery: 34, delivered: 423, cancelled: 12 };
const STATUS_META = {
  incoming:         { label: 'Incoming',         color: '#1D4ED8', bg: '#DBEAFE' },
  preparing:        { label: 'Preparing',         color: '#92400E', bg: '#FEF3C7' },
  out_for_delivery: { label: 'Out for Delivery',  color: '#0369A1', bg: '#E0F2FE' },
  delivered:        { label: 'Delivered',         color: '#166534', bg: '#DCFCE7' },
  cancelled:        { label: 'Cancelled',         color: '#991B1B', bg: '#FEE2E2' },
};

export default function SalesAnalytics() {
  const [period, setPeriod] = useState('30d');
  const [chartType, setChartType] = useState('revenue');
  const [toast, setToast] = useState('');

  const periodDays = { '7d': 7, '30d': 30, '90d': 30 };
  const displayDays = periodDays[period];
  const chartData = DAILY.slice(-displayDays);
  const maxVal = Math.max(...chartData.map(d => chartType === 'revenue' ? d.revenue : d.orders));
  const totalRev = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const maxCatRev = Math.max(...CATEGORY_DATA.map(c => c.revenue));

  const showMsg = msg => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  return (
    <div>
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Sales Analytics</h1>
          <p style={styles.sub}>Revenue, orders and performance breakdown</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7d','30d','90d'].map(p => (
            <button key={p} style={{ ...styles.periodBtn, ...(period === p ? styles.periodBtnActive : {}) }} onClick={() => setPeriod(p)}>
              {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
          <button className="btn-primary" style={{ background: '#16A34A', marginLeft: 8 }} onClick={() => showMsg('📥 Analytics exported to CSV!')}>
            <i className="fa-solid fa-file-csv" /> Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={styles.kpiGrid}>
        {[
          { label: 'Total Revenue', value: `$${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: 'fa-dollar-sign', color: '#16A34A', bg: '#F0FDF4', sub: '+20.1% vs prev period' },
          { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: 'fa-bag-shopping', color: '#2563EB', bg: '#EFF6FF', sub: '+12.5% vs prev period' },
          { label: 'Avg Order Value', value: `$${(totalRev / totalOrders).toFixed(2)}`, icon: 'fa-chart-simple', color: '#9333EA', bg: '#F5F3FF', sub: '+3.2% vs prev period' },
          { label: 'Total Customers', value: '2,400', icon: 'fa-users', color: '#E8391D', bg: '#FFF0EE', sub: '+5.2% vs prev period' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{k.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#1A1D2E', marginBottom: 6 }}>{k.value}</p>
                <p style={{ fontSize: 12, color: '#16A34A' }}><i className="fa-solid fa-arrow-trend-up" /> {k.sub}</p>
              </div>
              <div style={{ width: 44, height: 44, background: k.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${k.icon}`} style={{ fontSize: 18, color: k.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={styles.cardTitle}>
              {chartType === 'revenue' ? '💰 Revenue Trend' : '📦 Order Volume Trend'}
            </h3>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>{period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...styles.chartToggle, ...(chartType === 'revenue' ? styles.chartToggleActive : {}) }} onClick={() => setChartType('revenue')}>Revenue</button>
            <button style={{ ...styles.chartToggle, ...(chartType === 'orders' ? styles.chartToggleActive : {}) }} onClick={() => setChartType('orders')}>Orders</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, paddingBottom: 24, position: 'relative' }}>
          {/* Y-axis labels */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 180, paddingBottom: 24, marginRight: 8, width: 48, flexShrink: 0 }}>
            {[100, 75, 50, 25, 0].map(p => (
              <span key={p} style={{ fontSize: 9, color: '#D1D5DB', textAlign: 'right' }}>
                {chartType === 'revenue' ? `$${((maxVal * p) / 100 / 1000).toFixed(1)}k` : Math.floor((maxVal * p) / 100)}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, flex: 1, height: '100%' }}>
            {chartData.map((d, i) => {
              const val = chartType === 'revenue' ? d.revenue : d.orders;
              const pct = (val / maxVal) * 100;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 3 }}
                  title={`${d.date}: ${chartType === 'revenue' ? '$' + d.revenue.toFixed(0) : d.orders + ' orders'}`}>
                  <div style={{ width: '70%', height: `${Math.max(pct, 3)}%`, background: chartType === 'revenue' ? 'linear-gradient(to top, #16A34A, #4ADE80)' : 'linear-gradient(to top, #2563EB, #60A5FA)', borderRadius: '3px 3px 0 0', cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.target.style.opacity = '0.75'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                  />
                  {i % Math.ceil(chartData.length / 6) === 0 && (
                    <span style={{ fontSize: 8, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.twoCol}>
        {/* Top Dishes */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ ...styles.cardTitle, marginBottom: 20 }}>🏆 Top Performing Dishes</h3>
          {TOP_DISHES.map((d, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...styles.rankBadge, background: ['#FEF3C7','#F3F4F6','#FEF3C7','#F3F4F6','#F3F4F6'][i], color: ['#92400E','#374151','#92400E','#374151','#374151'][i] }}>
                    {['🥇','🥈','🥉','4','5'][i]}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D2E' }}>{d.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#E8391D' }}>${d.revenue.toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>{d.sold} sold</span>
                </div>
              </div>
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 50 }}>
                <div style={{ height: '100%', width: `${(d.sold / TOP_DISHES[0].sold) * 100}%`, background: ['#E8391D','#F59E0B','#8B5CF6','#06B6D4','#16A34A'][i], borderRadius: 50, transition: 'width 0.4s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ ...styles.cardTitle, marginBottom: 20 }}>📂 Revenue by Category</h3>
          {CATEGORY_DATA.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1, color: '#374151' }}>{c.name}</span>
              <div style={{ width: 80, height: 5, background: '#F3F4F6', borderRadius: 50 }}>
                <div style={{ height: '100%', width: `${(c.revenue / maxCatRev) * 100}%`, background: c.color, borderRadius: 50 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1D2E', minWidth: 60, textAlign: 'right' }}>${(c.revenue / 1000).toFixed(1)}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order status breakdown */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ ...styles.cardTitle, marginBottom: 20 }}>📊 Order Status Breakdown</h3>
        <div style={styles.statusGrid}>
          {Object.entries(STATUS_COUNTS).map(([key, count]) => {
            const m = STATUS_META[key];
            const total = Object.values(STATUS_COUNTS).reduce((s, v) => s + v, 0);
            return (
              <div key={key} style={{ ...styles.statusCard, background: m.bg }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: m.color, marginBottom: 6 }}>{m.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: m.color, marginBottom: 4 }}>{count}</p>
                <p style={{ fontSize: 11, color: m.color, opacity: 0.7 }}>{((count / total) * 100).toFixed(1)}% of total</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  toast: { position: 'fixed', top: 20, right: 24, background: '#16A34A', color: 'white', padding: '13px 22px', borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 500 },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E' },
  sub: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1A1D2E' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  periodBtn: { padding: '7px 14px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 13, cursor: 'pointer', color: '#6B7280' },
  periodBtnActive: { background: '#1A1D2E', borderColor: '#1A1D2E', color: 'white' },
  chartToggle: { padding: '6px 14px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 12, cursor: 'pointer', color: '#6B7280' },
  chartToggleActive: { background: '#1A1D2E', borderColor: '#1A1D2E', color: 'white' },
  rankBadge: { width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  statusCard: { padding: '18px 16px', borderRadius: 14 },
};
