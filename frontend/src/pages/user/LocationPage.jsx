import { useState, useEffect } from 'react';

const LABEL_OPTIONS = ['Home', 'Work', 'College', 'Gym', 'Other'];
const LABEL_ICONS = { Home: 'fa-house', Work: 'fa-briefcase', College: 'fa-graduation-cap', Gym: 'fa-dumbbell', Other: 'fa-location-dot' };

const DEFAULT_ADDRESSES = [
  { id: 1, label: 'Home', icon: 'fa-house', address: '42, Anna Nagar, Chennai - 600040', pincode: '600040' },
  { id: 2, label: 'Work', icon: 'fa-briefcase', address: '7th Floor, Tidel Park, Taramani, Chennai - 600113', pincode: '600113' },
];

export default function LocationPage() {
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('dvss_addresses');
      return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES;
    } catch { return DEFAULT_ADDRESSES; }
  });

  const [selectedId, setSelectedId] = useState(() => {
    return parseInt(localStorage.getItem('dvss_selected_addr') || '1');
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ label: 'Home', address: '', pincode: '', landmark: '' });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Persist to localStorage whenever addresses or selection changes
  useEffect(() => {
    localStorage.setItem('dvss_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('dvss_selected_addr', String(selectedId));
  }, [selectedId]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const openAddForm = () => {
    setEditId(null);
    setForm({ label: 'Home', address: '', pincode: '', landmark: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (addr) => {
    setEditId(addr.id);
    setForm({ label: addr.label, address: addr.address, pincode: addr.pincode || '', landmark: addr.landmark || '' });
    setFormError('');
    setShowForm(true);
  };

  const saveAddress = () => {
    if (!form.address.trim()) { setFormError('Please enter a full address.'); return; }
    if (!form.pincode.trim()) { setFormError('Please enter a pincode.'); return; }

    if (editId) {
      setAddresses(prev => prev.map(a => a.id === editId
        ? { ...a, label: form.label, icon: LABEL_ICONS[form.label] || 'fa-location-dot', address: form.address, pincode: form.pincode, landmark: form.landmark }
        : a
      ));
      showToast('Address updated successfully!');
    } else {
      const newAddr = {
        id: Date.now(),
        label: form.label,
        icon: LABEL_ICONS[form.label] || 'fa-location-dot',
        address: form.address,
        pincode: form.pincode,
        landmark: form.landmark,
      };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedId(newAddr.id);
      showToast('New address saved!');
    }
    setShowForm(false);
    setFormError('');
  };

  const deleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) {
      const remaining = addresses.filter(a => a.id !== id);
      if (remaining.length > 0) setSelectedId(remaining[0].id);
    }
    setDeleteConfirm(null);
    showToast('Address removed.');
  };

  const selectedAddr = addresses.find(a => a.id === selectedId);

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Toast */}
      {toast && (
        <div style={styles.toast}>
          <i className="fa-solid fa-circle-check" style={{ color: '#22C55E' }} /> {toast}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <i className="fa-solid fa-trash" style={{ fontSize: 32, color: '#EF4444', display: 'block', textAlign: 'center', marginBottom: 16 }} />
            <h3 style={{ textAlign: 'center', marginBottom: 8, fontSize: 18 }}>Delete Address?</h3>
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
              This will remove "{addresses.find(a => a.id === deleteConfirm)?.address}" permanently.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={styles.deleteBtn} onClick={() => deleteAddress(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>Delivery Location</h2>
          <p style={styles.sub}>Manage your saved delivery addresses</p>
        </div>
        <button className="btn-primary" style={{ display: 'inline-flex' }} onClick={openAddForm}>
          <i className="fa-solid fa-plus" /> Add New Address
        </button>
      </div>

      {/* Active delivery address banner */}
      {selectedAddr && (
        <div style={styles.activeBanner}>
          <div style={styles.activeDot} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 2 }}>DELIVERING TO</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1D2E' }}>{selectedAddr.label} — {selectedAddr.address}</p>
          </div>
          <i className="fa-solid fa-circle-check" style={{ color: '#16A34A', fontSize: 20 }} />
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card" style={styles.formCard}>
          <h3 style={styles.formTitle}>{editId ? '✏️ Edit Address' : '📍 Add New Address'}</h3>

          {formError && <div style={styles.formError}><i className="fa-solid fa-exclamation-circle" /> {formError}</div>}

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Label</label>
              <select value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}>
                {LABEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Pincode</label>
              <input
                placeholder="600001"
                value={form.pincode}
                onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                maxLength={6}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Full Address *</label>
            <textarea
              placeholder="Door no, Street name, Area, City..."
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              rows={3}
              style={{ resize: 'none', fontFamily: 'inherit', borderRadius: 10, border: '1.5px solid #E5E7EB', padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Landmark (optional)</label>
            <input
              placeholder="Near bus stand, opposite park..."
              value={form.landmark}
              onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))}
            />
          </div>

          <div style={styles.formActions}>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
            <button className="btn-primary" onClick={saveAddress} style={{ display: 'inline-flex' }}>
              <i className="fa-solid fa-floppy-disk" /> {editId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </div>
      )}

      {/* Saved addresses list */}
      <div style={styles.section}>
        <h3 style={styles.secTitle}>
          <i className="fa-solid fa-bookmark" style={{ color: '#E8391D' }} /> Saved Addresses
          <span style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', marginLeft: 8 }}>{addresses.length} saved</span>
        </h3>

        {addresses.length === 0 ? (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <i className="fa-solid fa-location-crosshairs" style={{ fontSize: 40, color: '#D1D5DB', marginBottom: 16, display: 'block' }} />
            <p style={{ color: '#9CA3AF', marginBottom: 16 }}>No addresses saved yet.</p>
            <button className="btn-primary" style={{ display: 'inline-flex' }} onClick={openAddForm}>
              <i className="fa-solid fa-plus" /> Add Your First Address
            </button>
          </div>
        ) : (
          addresses.map(addr => (
            <div
              key={addr.id}
              className="card"
              style={{ ...styles.addrCard, ...(selectedId === addr.id ? styles.addrCardActive : {}) }}
            >
              {/* Left: icon + content */}
              <div style={styles.addrLeft} onClick={() => setSelectedId(addr.id)}>
                <div style={{ ...styles.addrIcon, background: selectedId === addr.id ? '#FFF0EE' : '#F3F4F6' }}>
                  <i className={`fa-solid ${addr.icon}`} style={{ color: selectedId === addr.id ? '#E8391D' : '#9CA3AF', fontSize: 16 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={styles.addrLabel}>{addr.label}</p>
                    {selectedId === addr.id && <span style={styles.selectedTag}>Selected</span>}
                  </div>
                  <p style={styles.addrText}>{addr.address}</p>
                  {addr.pincode && <p style={styles.addrMeta}><i className="fa-solid fa-map-pin" style={{ fontSize: 10, marginRight: 4 }} />Pincode: {addr.pincode}</p>}
                  {addr.landmark && <p style={styles.addrMeta}><i className="fa-solid fa-signs-post" style={{ fontSize: 10, marginRight: 4 }} />{addr.landmark}</p>}
                </div>
              </div>

              {/* Right: actions */}
              <div style={styles.addrActions}>
                {selectedId !== addr.id && (
                  <button style={styles.selectBtn} onClick={() => setSelectedId(addr.id)}>
                    <i className="fa-regular fa-circle-dot" /> Select
                  </button>
                )}
                <button style={styles.editBtn} onClick={() => openEditForm(addr)}>
                  <i className="fa-solid fa-pen" />
                </button>
                <button style={styles.deleteIconBtn} onClick={() => setDeleteConfirm(addr.id)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Map placeholder */}
      <div style={styles.mapBox}>
        <i className="fa-solid fa-map-location-dot" style={{ fontSize: 36, color: '#9CA3AF', display: 'block', textAlign: 'center', marginBottom: 10 }} />
        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginBottom: 6 }}>Live map view</p>
        <p style={{ textAlign: 'center', color: '#D1D5DB', fontSize: 12 }}>Integrate Google Maps API key to enable pin-drop location selection</p>
      </div>
    </div>
  );
}

const styles = {
  toast: { position: 'fixed', top: 80, right: 24, background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 999, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'white', borderRadius: 20, padding: '32px 28px', width: 360, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  deleteBtn: { flex: 1, padding: '11px', borderRadius: 50, border: 'none', background: '#EF4444', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E', marginBottom: 4 },
  sub: { fontSize: 14, color: '#9CA3AF' },
  activeBanner: { background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 },
  activeDot: { width: 10, height: 10, borderRadius: '50%', background: '#22C55E', flexShrink: 0, boxShadow: '0 0 0 3px #BBF7D0' },
  formCard: { padding: '24px', marginBottom: 24 },
  formTitle: { fontSize: 17, fontWeight: 700, color: '#1A1D2E', marginBottom: 18 },
  formError: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 },
  formActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  section: { marginBottom: 24 },
  secTitle: { fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  addrCard: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '18px 20px', marginBottom: 12, border: '1.5px solid #E5E7EB', transition: 'all 0.2s' },
  addrCardActive: { borderColor: '#E8391D', background: '#FFF9F8' },
  addrLeft: { display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, cursor: 'pointer' },
  addrIcon: { width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' },
  addrLabel: { fontWeight: 700, fontSize: 14, color: '#1A1D2E', marginBottom: 3 },
  selectedTag: { background: '#E8391D', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50 },
  addrText: { fontSize: 13, color: '#6B7280', lineHeight: 1.5 },
  addrMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 3, display: 'flex', alignItems: 'center' },
  addrActions: { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  selectBtn: { padding: '6px 14px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#374151' },
  editBtn: { width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280', fontSize: 13 },
  deleteIconBtn: { width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #FEE2E2', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444', fontSize: 13 },
  mapBox: { background: 'white', border: '1.5px dashed #E5E7EB', borderRadius: 16, padding: '36px 20px' },
};
