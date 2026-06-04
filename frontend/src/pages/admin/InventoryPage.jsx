import { useState } from 'react';
import axios from 'axios';

const DEMO_INVENTORY = [
  { id: 1, name: 'Butter Chicken', category: 'Curries', price: 13.99, is_available: true, total_ordered: 312, order_count: 189, total_revenue: 4365.88 },
  { id: 2, name: 'Chicken Biryani', category: 'Rice', price: 13.49, is_available: true, total_ordered: 289, order_count: 201, total_revenue: 3896.61 },
  { id: 3, name: 'Margherita Pizza', category: 'Pizza', price: 12.99, is_available: true, total_ordered: 241, order_count: 175, total_revenue: 3130.59 },
  { id: 4, name: 'Pepperoni Pizza', category: 'Pizza', price: 14.99, is_available: true, total_ordered: 198, order_count: 142, total_revenue: 2968.02 },
  { id: 5, name: 'Chicken Burger', category: 'Burgers', price: 9.99, is_available: true, total_ordered: 198, order_count: 156, total_revenue: 1978.02 },
  { id: 6, name: 'Masala Dosa', category: 'South Indian', price: 6.99, is_available: true, total_ordered: 176, order_count: 134, total_revenue: 1230.24 },
  { id: 7, name: 'Paneer Tikka', category: 'Starters', price: 10.99, is_available: false, total_ordered: 143, order_count: 98, total_revenue: 1571.57 },
  { id: 8, name: 'BBQ Beef Burger', category: 'Burgers', price: 11.99, is_available: true, total_ordered: 132, order_count: 110, total_revenue: 1582.68 },
  { id: 9, name: 'Caesar Salad', category: 'Salads', price: 7.99, is_available: true, total_ordered: 118, order_count: 92, total_revenue: 942.82 },
  { id: 10, name: 'Dal Makhani', category: 'Curries', price: 11.49, is_available: false, total_ordered: 97, order_count: 76, total_revenue: 1114.53 },
  { id: 11, name: 'Chocolate Brownie', category: 'Desserts', price: 5.99, is_available: true, total_ordered: 89, order_count: 71, total_revenue: 533.11 },
  { id: 12, name: 'Mango Lassi', category: 'Beverages', price: 3.99, is_available: true, total_ordered: 234, order_count: 188, total_revenue: 933.66 },
  { id: 13, name: 'Chicken Shawarma', category: 'Wraps', price: 9.99, is_available: true, total_ordered: 76, order_count: 58, total_revenue: 759.24 },
  { id: 14, name: 'Veg Fried Rice', category: 'Rice', price: 8.49, is_available: true, total_ordered: 112, order_count: 89, total_revenue: 950.88 },
  { id: 15, name: 'Idli Sambar', category: 'South Indian', price: 5.99, is_available: true, total_ordered: 95, order_count: 72, total_revenue: 569.05 },
];

export default function InventoryPage() {
  const [items, setItems] = useState(DEMO_INVENTORY);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ msg: '', color: '#1A1D2E' });
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Pizza', price: '', description: '' });
  const [sortBy, setSortBy] = useState('total_ordered');
  const [filterAvail, setFilterAvail] = useState('all');

  const showMsg = (msg, color = '#16A34A') => { setToast({ msg, color }); setTimeout(() => setToast({ msg: '' }), 2500); };

  const toggle = async (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: !i.is_available } : i));
    const item = items.find(i => i.id === id);
    showMsg(`${item.is_available ? '🔴 Disabled' : '🟢 Enabled'}: ${item.name}`, item.is_available ? '#E8391D' : '#16A34A');
    try { await axios.put(`/api/inventory/${id}/toggle`); } catch {}
  };

  const handleAdd = () => {
    if (!form.name || !form.price) { showMsg('Fill in name and price.', '#E8391D'); return; }
    const newItem = { id: Date.now(), name: form.name, category: form.category, price: parseFloat(form.price), is_available: true, total_ordered: 0, order_count: 0, total_revenue: 0 };
    setItems(prev => [newItem, ...prev]);
    showMsg(`✅ "${form.name}" added to inventory!`);
    setShowAdd(false);
    setForm({ name: '', category: 'Pizza', price: '', description: '' });
  };

  const handleEdit = () => {
    if (!form.name || !form.price) { showMsg('Fill in name and price.', '#E8391D'); return; }
    setItems(prev => prev.map(i => i.id === showEdit ? { ...i, name: form.name, category: form.category, price: parseFloat(form.price) } : i));
    showMsg(`✅ "${form.name}" updated!`);
    setShowEdit(null);
  };

  const handleDelete = (id) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    showMsg(`🗑️ "${item.name}" removed from inventory.`, '#E8391D');
  };

  const openEdit = (item) => { setForm({ name: item.name, category: item.category, price: item.price, description: '' }); setShowEdit(item.id); };

  let filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase());
    const matchAvail = filterAvail === 'all' || (filterAvail === 'available' ? i.is_available : !i.is_available);
    return matchSearch && matchAvail;
  });
  filtered = [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);

  const CATEGORIES = ['Pizza','Burgers','Rice','Starters','Salads','South Indian','Desserts','Beverages','Curries','Wraps'];

  const FormModal = ({ title, onSave, onClose }) => (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginBottom: 18, fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <div style={{ marginBottom: 14 }}><label style={styles.label}>Dish Name *</label><input placeholder="e.g. Paneer Butter Masala" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={styles.label}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={styles.label}>Price ($) *</label><input type="number" placeholder="12.99" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
        </div>
        <div style={{ marginBottom: 20 }}><label style={styles.label}>Description</label><input placeholder="Short description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onSave}><i className="fa-solid fa-floppy-disk" /> Save</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {toast.msg && <div style={{ ...styles.toast, background: toast.color }}>{toast.msg}</div>}
      {showAdd && <FormModal title="🍽️ Add New Dish" onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {showEdit && <FormModal title="✏️ Edit Dish" onSave={handleEdit} onClose={() => setShowEdit(null)} />}

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Inventory Management</h1>
          <p style={styles.sub}>Track dish availability, order history and performance</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ name: '', category: 'Pizza', price: '', description: '' }); setShowAdd(true); }}>
          <i className="fa-solid fa-plus" /> Add New Dish
        </button>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Items', value: items.length, color: '#1A1D2E', bg: '#F3F4F6' },
          { label: 'Available', value: items.filter(i => i.is_available).length, color: '#166534', bg: '#DCFCE7' },
          { label: 'Unavailable', value: items.filter(i => !i.is_available).length, color: '#991B1B', bg: '#FEE2E2' },
          { label: 'Total Units Sold', value: items.reduce((s, i) => s + i.total_ordered, 0).toLocaleString(), color: '#1D4ED8', bg: '#DBEAFE' },
          { label: 'Total Revenue', value: `$${items.reduce((s, i) => s + i.total_revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`, color: '#166534', bg: '#F0FDF4' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px', background: s.bg, border: 'none' }}>
            <p style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        <div style={{ position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13 }} />
          <input placeholder="Search dishes or category..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, borderRadius: 50, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', width: 260, padding: '9px 16px 9px 40px' }} />
        </div>
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)} style={{ padding: '9px 14px', borderRadius: 50, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none', background: 'white' }}>
          <option value="all">All Items</option>
          <option value="available">Available Only</option>
          <option value="unavailable">Unavailable Only</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '9px 14px', borderRadius: 50, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none', background: 'white' }}>
          <option value="total_ordered">Sort: Most Ordered</option>
          <option value="total_revenue">Sort: Revenue</option>
          <option value="price">Sort: Price</option>
        </select>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Dish Name', 'Category', 'Price', 'Orders', 'Units Sold', 'Revenue', 'Status', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No items found</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}><span style={{ fontWeight: 600, color: '#1A1D2E' }}>{item.name}</span></td>
                <td style={styles.td}><span className="badge badge-gray">{item.category}</span></td>
                <td style={styles.td}>${parseFloat(item.price).toFixed(2)}</td>
                <td style={styles.td}>{item.order_count}</td>
                <td style={styles.td}><span style={{ fontWeight: 700, color: item.total_ordered > 100 ? '#16A34A' : '#374151' }}>{item.total_ordered}</span></td>
                <td style={styles.td}><span style={{ fontWeight: 600, color: '#1A1D2E' }}>${parseFloat(item.total_revenue).toFixed(2)}</span></td>
                <td style={styles.td}><span className={`badge ${item.is_available ? 'badge-green' : 'badge-red'}`}>{item.is_available ? 'Available' : 'Unavailable'}</span></td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={styles.iconBtn} onClick={() => openEdit(item)} title="Edit"><i className="fa-solid fa-pen" /></button>
                    <button style={{ ...styles.iconBtn, ...(item.is_available ? styles.disableBtn : styles.enableBtn) }} onClick={() => toggle(item.id)} title={item.is_available ? 'Disable' : 'Enable'}>
                      <i className={`fa-solid ${item.is_available ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                    <button style={{ ...styles.iconBtn, ...styles.deleteBtn }} onClick={() => handleDelete(item.id)} title="Delete"><i className="fa-solid fa-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  toast: { position: 'fixed', top: 20, right: 24, color: 'white', padding: '13px 22px', borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'white', borderRadius: 20, padding: '32px 28px', width: 420, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E' },
  sub: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 20 },
  filterRow: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 14px', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #E5E7EB' },
  tr: { borderBottom: '1px solid #F9FAFB' },
  td: { padding: '13px 14px', fontSize: 14, color: '#374151' },
  iconBtn: { width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: '#6B7280' },
  disableBtn: { borderColor: '#FEE2E2', background: '#FFF5F5', color: '#EF4444' },
  enableBtn: { borderColor: '#DCFCE7', background: '#F0FDF4', color: '#16A34A' },
  deleteBtn: { borderColor: '#FEE2E2', background: '#FFF5F5', color: '#EF4444' },
};
