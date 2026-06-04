import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const fetchCart = () => {
    setLoading(true);
    axios.get('/api/cart')
      .then(r => setCart(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (id, qty) => {
    await axios.put(`/api/cart/${id}`, { quantity: qty });
    fetchCart();
  };

  const removeItem = async (id) => {
    await axios.delete(`/api/cart/${id}`);
    fetchCart();
  };

  const total = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  const placeOrder = async () => {
    if (!address.trim()) { showToast('Please enter a delivery address.'); return; }
    setPlacing(true);
    try {
      const items = cart.map(i => ({ dish_id: i.dish_id, quantity: i.quantity, price: i.price }));
      await axios.post('/api/orders', { items, delivery_address: address, payment_mode: paymentMode });
      showToast('🎉 Order placed successfully!');
      setTimeout(() => navigate('/home/orders'), 1500);
    } catch { showToast('Failed to place order. Try again.'); }
    finally { setPlacing(false); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div>
      {toast && <div style={styles.toast}>{toast}</div>}
      <h2 style={styles.title}>Your Cart</h2>

      {cart.length === 0 ? (
        <div style={styles.empty}>
          <i className="fa-solid fa-cart-shopping" style={{ fontSize: 52, color: '#D1D5DB', display: 'block', textAlign: 'center', marginBottom: 16 }} />
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 16 }}>Your cart is empty.</p>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="btn-primary" onClick={() => navigate('/home')} style={{ display: 'inline-flex' }}>
              <i className="fa-solid fa-utensils" /> Browse Menu
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.layout}>
          {/* Cart Items */}
          <div style={styles.itemsCol}>
            {cart.map(item => (
              <div key={item.id} className="card" style={styles.cartItem}>
                <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80'} alt={item.name} style={styles.itemImg} />
                <div style={styles.itemInfo}>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <span className="badge badge-gray">{item.category}</span>
                </div>
                <div style={styles.qtyCtrl}>
                  <button style={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span style={styles.qtyNum}>{item.quantity}</span>
                  <button style={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <span style={styles.itemPrice}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                <button style={styles.removeBtn} onClick={() => removeItem(item.id)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card" style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            <div style={styles.summaryRow}><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div style={styles.summaryRow}><span>Delivery Fee</span><span style={{ color: '#22C55E' }}>Free</span></div>
            <div style={{ ...styles.summaryRow, ...styles.totalRow }}><span>Total</span><span>${total.toFixed(2)}</span></div>

            <div style={{ margin: '20px 0' }}>
              <label style={styles.label}>Delivery Address</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                rows={3}
                style={{ width: '100%', resize: 'none', marginTop: 6, borderRadius: 10, border: '1.5px solid #E5E7EB', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={styles.label}>Payment Mode</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={{ marginTop: 6 }}>
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit / Debit Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={placeOrder} disabled={placing}>
              {placing ? 'Placing Order...' : <><i className="fa-solid fa-bag-shopping" /> Place Order</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  toast: { position: 'fixed', top: 80, right: 24, background: '#1A1D2E', color: 'white', padding: '12px 20px', borderRadius: 12, zIndex: 999, fontSize: 14, fontWeight: 500 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E', marginBottom: 24 },
  empty: { padding: '60px 20px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' },
  itemsCol: { display: 'flex', flexDirection: 'column', gap: 14 },
  cartItem: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' },
  itemImg: { width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  itemName: { fontSize: 15, fontWeight: 600, color: '#1A1D2E' },
  qtyCtrl: { display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #E5E7EB', borderRadius: 50, padding: '4px 8px' },
  qtyBtn: { background: 'none', border: 'none', fontSize: 18, fontWeight: 600, cursor: 'pointer', color: '#E8391D', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' },
  qtyNum: { fontWeight: 600, fontSize: 15, minWidth: 20, textAlign: 'center' },
  itemPrice: { fontSize: 16, fontWeight: 700, color: '#1A1D2E', minWidth: 70, textAlign: 'right' },
  removeBtn: { background: 'none', border: 'none', color: '#EF4444', fontSize: 16, cursor: 'pointer', padding: 4 },
  summaryCard: { padding: '24px' },
  summaryTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1A1D2E' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280', marginBottom: 12 },
  totalRow: { borderTop: '1px solid #F3F4F6', paddingTop: 12, fontSize: 18, fontWeight: 700, color: '#1A1D2E', marginTop: 4 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' }
};
