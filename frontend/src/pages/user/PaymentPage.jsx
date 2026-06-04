import { useState } from 'react';

const METHODS = [
  { id: 'cash', label: 'Cash on Delivery', icon: 'fa-money-bills', desc: 'Pay when your order arrives' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'fa-credit-card', desc: 'Visa, Mastercard, RuPay accepted' },
  { id: 'upi',  label: 'UPI Payment', icon: 'fa-mobile-screen', desc: 'GPay, PhonePe, Paytm & more' },
];

export default function PaymentPage() {
  const [selected, setSelected] = useState('cash');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  return (
    <div style={{ maxWidth: 620 }}>
      <h2 style={styles.title}>Payment Mode</h2>
      <p style={styles.sub}>Choose how you'd like to pay for your orders</p>

      <div style={styles.methods}>
        {METHODS.map(m => (
          <div
            key={m.id}
            className="card"
            style={{ ...styles.methodCard, ...(selected === m.id ? styles.methodActive : {}) }}
            onClick={() => setSelected(m.id)}
          >
            <div style={styles.methodIcon}>
              <i className={`fa-solid ${m.icon}`} style={{ fontSize: 22, color: selected === m.id ? '#E8391D' : '#9CA3AF' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={styles.methodLabel}>{m.label}</p>
              <p style={styles.methodDesc}>{m.desc}</p>
            </div>
            <div style={{ ...styles.radio, ...(selected === m.id ? styles.radioActive : {}) }}>
              {selected === m.id && <div style={styles.radioDot} />}
            </div>
          </div>
        ))}
      </div>

      {selected === 'card' && (
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={styles.secTitle}>Card Details</h3>
          <div style={styles.field}>
            <label style={styles.label}>Card Number</label>
            <input placeholder="0000 0000 0000 0000" value={cardNo} onChange={e => setCardNo(formatCard(e.target.value))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={styles.field}>
              <label style={styles.label}>Expiry</label>
              <input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>CVV</label>
              <input placeholder="•••" type="password" value={cvv} onChange={e => setCvv(e.target.value)} maxLength={3} />
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            <i className="fa-solid fa-lock" /> Save Card
          </button>
        </div>
      )}

      {selected === 'upi' && (
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={styles.secTitle}>UPI ID</h3>
          <div style={styles.field}>
            <label style={styles.label}>Your UPI ID</label>
            <input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            <i className="fa-solid fa-circle-check" /> Verify & Save
          </button>
        </div>
      )}

      {selected === 'cash' && (
        <div style={styles.cashNote}>
          <i className="fa-solid fa-circle-info" style={{ color: '#E8391D', fontSize: 18 }} />
          <p>Keep exact change ready when your delivery partner arrives. No additional charges.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E', marginBottom: 6 },
  sub: { fontSize: 14, color: '#9CA3AF', marginBottom: 28 },
  methods: { display: 'flex', flexDirection: 'column', gap: 12 },
  methodCard: { display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', cursor: 'pointer', border: '1.5px solid #E5E7EB', transition: 'all 0.2s' },
  methodActive: { borderColor: '#E8391D', background: '#FFF9F8' },
  methodIcon: { width: 50, height: 50, borderRadius: 14, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  methodLabel: { fontWeight: 600, fontSize: 15, color: '#1A1D2E', marginBottom: 2 },
  methodDesc: { fontSize: 13, color: '#9CA3AF' },
  radio: { width: 20, height: 20, borderRadius: '50%', border: '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioActive: { borderColor: '#E8391D' },
  radioDot: { width: 10, height: 10, borderRadius: '50%', background: '#E8391D' },
  secTitle: { fontSize: 16, fontWeight: 700, color: '#1A1D2E', marginBottom: 18 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 },
  cashNote: { display: 'flex', alignItems: 'flex-start', gap: 12, background: '#FFF0EE', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 18px', marginTop: 20 }
};
