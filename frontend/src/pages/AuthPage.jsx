import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role };
      const { data } = await axios.post(endpoint, payload);
      login(data.token, data.user);
      // Route based on role returned from server
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      if (!err.response) {
        // Backend offline — use demo mode based on selected role
        if (mode === 'login') {
          setError('Cannot reach server. Use demo: admin@eatsadmin.com / admin123 or alice@example.com / user123');
        } else {
          // Demo offline register — route by selected role
          const demoUser = { id: 0, name: form.name, email: form.email, role: form.role };
          login('demo-token', demoUser);
          navigate(form.role === 'admin' ? '/admin' : '/home');
        }
      } else {
        setError(err.response?.data?.message || (mode === 'register' ? 'Registration failed. Please try again.' : 'Login failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setForm({ name: '', email: '', password: '', role: 'user' }); };

  return (
    <div style={styles.root}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✳</span>
          <span style={styles.logoText}>DVSS</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.navLink} onClick={() => { setMode('login'); setError(''); }}>Login</button>
          <button style={styles.signupBtn} onClick={() => { setMode('register'); setError(''); }}>Sign Up</button>
        </div>
      </nav>

      <div style={styles.body}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <h1 style={styles.leftTitle}>DVSS</h1>
          <p style={styles.leftSub}>Join the elite community of smart eaters. One account for food, diet, and health.</p>
          <div style={styles.features}>
            {['Personalized AI Diet Plans', 'Fast Delivery Guarantee', 'Track Your Order Live'].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Role info cards */}
          <div style={styles.roleCards}>
            <div style={styles.roleCard}>
              <i className="fa-solid fa-user" style={{ color: '#E8391D', fontSize: 18 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'white', marginBottom: 2 }}>Customer</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Browse menu, order food, track delivery</p>
              </div>
            </div>
            <div style={styles.roleCard}>
              <i className="fa-solid fa-store" style={{ color: '#22C55E', fontSize: 18 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'white', marginBottom: 2 }}>Restaurant Admin</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Manage orders, inventory, analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div style={styles.formWrap}>
          <h2 style={styles.formTitle}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={styles.formSub}>{mode === 'login' ? 'Login to your DVSS account.' : 'Start your journey with DVSS today.'}</p>

          {error && <div style={styles.errorBox}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}</div>}

          <form onSubmit={submit} style={styles.form}>
            {mode === 'register' && (
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrap}>
                  <i className="fa-solid fa-user" style={styles.inputIcon} />
                  <input name="name" value={form.name} onChange={handle} placeholder="Your full name" required style={{ paddingLeft: 40 }} />
                </div>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <i className="fa-solid fa-envelope" style={styles.inputIcon} />
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <i className="fa-solid fa-lock" style={styles.inputIcon} />
                <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required style={{ paddingLeft: 40 }} />
              </div>
            </div>

            {/* Role dropdown — always visible in register */}
            {mode === 'register' && (
              <div style={styles.field}>
                <label style={styles.label}>I am signing up as</label>
                <div style={styles.inputWrap}>
                  <i className="fa-solid fa-id-badge" style={styles.inputIcon} />
                  <select name="role" value={form.role} onChange={handle} style={{ paddingLeft: 40 }}>
                    <option value="user">👤 Customer — order food</option>
                    <option value="admin">🏪 Restaurant Admin — manage restaurant</option>
                  </select>
                </div>
                {/* Visual role preview */}
                <div style={{ ...styles.rolePreview, background: form.role === 'admin' ? '#F0FDF4' : '#FFF0EE', borderColor: form.role === 'admin' ? '#86EFAC' : '#FECACA' }}>
                  <i className={`fa-solid ${form.role === 'admin' ? 'fa-store' : 'fa-utensils'}`} style={{ color: form.role === 'admin' ? '#16A34A' : '#E8391D' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: form.role === 'admin' ? '#166534' : '#991B1B' }}>
                    {form.role === 'admin'
                      ? 'You will be taken to the Restaurant Admin Dashboard'
                      : 'You will be taken to the Customer Home Page'}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: 8, borderRadius: 50, padding: '14px', fontSize: 15 }}
              disabled={loading}
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Please wait...</>
                : mode === 'login'
                  ? <><i className="fa-solid fa-arrow-right-to-bracket" /> Login</>
                  : <><i className="fa-solid fa-user-plus" /> Get Started</>
              }
            </button>
          </form>

          {mode === 'login' && (
            <div style={styles.demoBox}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Demo accounts:</p>
              <div style={styles.demoRow}>
                <button style={styles.demoBtn} onClick={() => setForm(f => ({ ...f, email: 'admin@eatsadmin.com', password: 'admin123' }))}>
                  <i className="fa-solid fa-store" /> Admin
                </button>
                <button style={styles.demoBtn} onClick={() => setForm(f => ({ ...f, email: 'alice@example.com', password: 'user123' }))}>
                  <i className="fa-solid fa-user" /> Customer
                </button>
              </div>
            </div>
          )}

          <p style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button style={styles.switchLink} onClick={switchMode}>
              {mode === 'login' ? 'Sign Up →' : 'Login →'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column' },
  nav: { background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { color: '#E8391D', fontSize: 22, fontWeight: 700 },
  logoText: { fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  navLink: { background: 'none', border: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer', color: '#374151' },
  signupBtn: { background: '#E8391D', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  body: { flex: 1, display: 'flex', alignItems: 'stretch', padding: '48px 80px', gap: 48, maxWidth: 1100, margin: '0 auto', width: '100%' },
  leftPanel: { background: '#1A1D2E', borderRadius: 20, padding: '52px 44px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' },
  leftTitle: { fontFamily: 'Georgia, serif', fontSize: 56, fontWeight: 700, marginBottom: 20, color: 'white' },
  leftSub: { fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', marginBottom: 32 },
  features: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  check: { color: '#22C55E', fontSize: 16, fontWeight: 700 },
  roleCards: { display: 'flex', flexDirection: 'column', gap: 10 },
  roleCard: { display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' },
  formWrap: { background: 'white', borderRadius: 20, padding: '48px 44px', width: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  formTitle: { fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#1A1D2E' },
  formSub: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  errorBox: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', padding: '11px 16px', borderRadius: 10, fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'flex-start' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13, zIndex: 1 },
  rolePreview: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid', marginTop: 8, fontSize: 13 },
  demoBox: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginTop: 18 },
  demoRow: { display: 'flex', gap: 8 },
  demoBtn: { flex: 1, padding: '7px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#374151' },
  switchText: { marginTop: 22, textAlign: 'center', fontSize: 14, color: '#6B7280' },
  switchLink: { background: 'none', border: 'none', color: '#E8391D', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
};
