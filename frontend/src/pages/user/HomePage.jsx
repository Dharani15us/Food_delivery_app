import { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['All', 'Pizza', 'Burgers', 'Rice', 'Starters', 'Salads', 'South Indian', 'Desserts', 'Beverages', 'Curries', 'Wraps'];

// Default dishes shown immediately — no API needed
const DEFAULT_DISHES = [
  { id: 'd1', name: 'Margherita Pizza', description: 'Classic tomato base with fresh mozzarella and basil leaves', price: 12.99, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80', is_default: true },
  { id: 'd2', name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni on a rich tomato and cheese base', price: 14.99, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', is_default: true },
  { id: 'd3', name: 'Chicken Burger', description: 'Crispy fried chicken fillet with lettuce, tomato and signature sauce', price: 9.99, category: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', is_default: true },
  { id: 'd4', name: 'BBQ Beef Burger', description: 'Juicy beef patty with smoky BBQ sauce, caramelised onions and cheddar', price: 11.99, category: 'Burgers', image_url: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80', is_default: true },
  { id: 'd5', name: 'Chicken Biryani', description: 'Fragrant basmati rice slow-cooked with tender chicken and whole spices', price: 13.49, category: 'Rice', image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&q=80', is_default: true },
  { id: 'd6', name: 'Veg Fried Rice', description: 'Wok-tossed basmati rice with seasonal vegetables and soy sauce', price: 8.49, category: 'Rice', image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', is_default: true },
  { id: 'd7', name: 'Paneer Tikka', description: 'Tandoor-grilled cottage cheese marinated in yoghurt and aromatic spices', price: 10.99, category: 'Starters', image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', is_default: true },
  { id: 'd8', name: 'Chicken Wings', description: 'Crispy wings tossed in hot buffalo sauce, served with blue cheese dip', price: 9.49, category: 'Starters', image_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80', is_default: true },
  { id: 'd9', name: 'Caesar Salad', description: 'Crisp romaine, croutons, parmesan and classic caesar dressing', price: 7.99, category: 'Salads', image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80', is_default: true },
  { id: 'd10', name: 'Masala Dosa', description: 'Crispy rice-lentil crepe filled with spiced potato masala, served with chutneys', price: 6.99, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80', is_default: true },
  { id: 'd11', name: 'Idli Sambar', description: 'Steamed rice cakes served with lentil stew and coconut chutney', price: 5.99, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80', is_default: true },
  { id: 'd12', name: 'Chocolate Brownie', description: 'Warm dense fudge brownie with a scoop of vanilla ice cream', price: 5.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80', is_default: true },
  { id: 'd13', name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup', price: 4.49, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1601303516534-bf9a1abc6f7b?w=400&q=80', is_default: true },
  { id: 'd14', name: 'Mango Lassi', description: 'Thick chilled yoghurt drink blended with fresh Alphonso mango pulp', price: 3.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1571196284557-92ab44afc298?w=400&q=80', is_default: true },
  { id: 'd15', name: 'Cold Coffee', description: 'Chilled espresso blended with milk, ice and a hint of vanilla', price: 3.49, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', is_default: true },
  { id: 'd16', name: 'Butter Chicken', description: 'Tender chicken in a velvety tomato-cream sauce with butter and fenugreek', price: 13.99, category: 'Curries', image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', is_default: true },
  { id: 'd17', name: 'Dal Makhani', description: 'Slow-cooked black lentils in a rich buttery tomato gravy', price: 11.49, category: 'Curries', image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', is_default: true },
  { id: 'd18', name: 'Veggie Wrap', description: 'Grilled peppers, zucchini and hummus wrapped in a whole-wheat tortilla', price: 8.99, category: 'Wraps', image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', is_default: true },
  { id: 'd19', name: 'Chicken Shawarma', description: 'Spiced chicken strips with garlic sauce and pickles in a soft wrap', price: 9.99, category: 'Wraps', image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', is_default: true },
  { id: 'd20', name: 'Greek Salad', description: 'Tomatoes, cucumber, olives, red onion and feta with olive oil dressing', price: 8.49, category: 'Salads', image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80', is_default: true },
];

export default function HomePage() {
  const [dishes, setDishes] = useState(DEFAULT_DISHES); // ← show defaults instantly
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [apiLoaded, setApiLoaded] = useState(false);
  const [addedMap, setAddedMap] = useState({});
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  // Silently try to load from API — keep defaults if it fails
  useEffect(() => {
    const load = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        const { data } = await axios.get('/api/dishes', { params });
        if (data && data.length > 0) {
          setDishes(data);
          setApiLoaded(true);
        } else if (apiLoaded) {
          // API returned empty (e.g. search/filter with no results)
          setDishes([]);
        }
        // If API returns empty on first load, keep defaults
      } catch {
        // Silently fall back to defaults / filtered defaults
        if (search || category !== 'All') {
          const filtered = DEFAULT_DISHES.filter(d => {
            const matchCat = category === 'All' || d.category === category;
            const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchSearch;
          });
          setDishes(filtered);
        } else {
          setDishes(DEFAULT_DISHES);
        }
      }
    };
    load();
  }, [search, category]);

  const addToCart = async (dish) => {
    if (dish.is_default) {
      showToast('Connect to backend to add items to cart!', 'info');
      return;
    }
    try {
      await axios.post('/api/cart', { dish_id: dish.id, quantity: 1 });
      setAddedMap(m => ({ ...m, [dish.id]: true }));
      showToast(`${dish.name} added to cart!`, 'success');
      setTimeout(() => setAddedMap(m => ({ ...m, [dish.id]: false })), 1500);
    } catch {
      showToast('Failed to add. Please try again.', 'error');
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 2500);
  };

  const toastColors = { success: '#22C55E', info: '#2563EB', error: '#EF4444' };
  const toastIcons = { success: 'fa-circle-check', info: 'fa-circle-info', error: 'fa-circle-xmark' };

  return (
    <div>
      {toast.msg && (
        <div style={styles.toast}>
          <i className={`fa-solid ${toastIcons[toast.type]}`} style={{ color: toastColors[toast.type] }} />
          {toast.msg}
        </div>
      )}

      {/* Hero Banner */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>What are you <span style={{ color: '#E8391D' }}>craving</span> today?</h1>
          <p style={styles.heroSub}>Fresh meals delivered to your door in 30 minutes.</p>
          <div style={styles.heroBadges}>
            <span style={styles.heroBadge}><i className="fa-solid fa-bolt" style={{ color: '#F59E0B' }} /> Fast Delivery</span>
            <span style={styles.heroBadge}><i className="fa-solid fa-star" style={{ color: '#F59E0B' }} /> Top Rated</span>
            <span style={styles.heroBadge}><i className="fa-solid fa-shield-halved" style={{ color: '#22C55E' }} /> Safe & Hygienic</span>
          </div>
        </div>
        <div style={styles.searchWrap}>
          <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Search dishes, cuisines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Featured strip */}
      <div style={styles.featuredStrip}>
        {[
          { icon: '🍕', label: 'Pizza', color: '#FEF3C7' },
          { icon: '🍔', label: 'Burgers', color: '#FEE2E2' },
          { icon: '🍛', label: 'Curries', color: '#F0FDF4' },
          { icon: '🥗', label: 'Salads', color: '#DBEAFE' },
          { icon: '🍚', label: 'Rice', color: '#F5F3FF' },
          { icon: '🥤', label: 'Beverages', color: '#ECFDF5' },
        ].map(f => (
          <button
            key={f.label}
            style={{ ...styles.featuredBtn, background: category === f.label ? '#1A1D2E' : f.color }}
            onClick={() => setCategory(category === f.label ? 'All' : f.label)}
          >
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: category === f.label ? 'white' : '#374151' }}>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Category filter pills */}
      <div style={styles.catRow}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            style={{ ...styles.catBtn, ...(category === c ? styles.catBtnActive : {}) }}
            onClick={() => setCategory(c)}
          >{c}</button>
        ))}
      </div>

      {/* Section heading */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>
          {category === 'All' ? '🍽️ All Dishes' : `${category}`}
          <span style={styles.dishCount}>{dishes.length} items</span>
        </h2>
        {!apiLoaded && (
          <span style={styles.offlineBadge}>
            <i className="fa-solid fa-circle" style={{ color: '#F59E0B', fontSize: 8 }} /> Showing default menu
          </span>
        )}
      </div>

      {/* Dishes Grid */}
      {dishes.length === 0 ? (
        <div style={styles.empty}>
          <i className="fa-solid fa-bowl-food" style={{ fontSize: 48, color: '#D1D5DB', display: 'block', textAlign: 'center', marginBottom: 16 }} />
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 16 }}>No dishes found. Try a different search.</p>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => { setSearch(''); setCategory('All'); }}>Clear filters</button>
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {dishes.map(dish => (
            <div key={dish.id} className="card" style={styles.dishCard}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.dishImgWrap}>
                <img
                  src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                  alt={dish.name}
                  style={styles.dishImg}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }}
                />
                <span className="badge badge-gray" style={styles.catBadge}>{dish.category}</span>
                {dish.is_default && <span style={styles.popularBadge}>⭐ Popular</span>}
              </div>
              <div style={styles.dishBody}>
                <h3 style={styles.dishName}>{dish.name}</h3>
                <p style={styles.dishDesc}>{dish.description}</p>
                <div style={styles.dishFooter}>
                  <div>
                    <span style={styles.dishPrice}>${parseFloat(dish.price).toFixed(2)}</span>
                    <div style={styles.rating}>
                      {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#F59E0B', fontSize: 12 }}>{s}</span>)}
                      <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>4.8</span>
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: '9px 18px', fontSize: 13, borderRadius: 50, minWidth: 110 }}
                    onClick={() => addToCart(dish)}
                    disabled={addedMap[dish.id]}
                  >
                    {addedMap[dish.id]
                      ? <><i className="fa-solid fa-check" /> Added</>
                      : <><i className="fa-solid fa-plus" /> Add to Cart</>
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  toast: {
    position: 'fixed', top: 80, right: 24, background: 'white',
    border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 999,
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500
  },
  hero: {
    background: 'linear-gradient(135deg, #1A1D2E 0%, #2D3250 100%)',
    borderRadius: 20, padding: '40px 48px', marginBottom: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40
  },
  heroTitle: { color: 'white', fontSize: 32, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 16 },
  heroBadges: { display: 'flex', gap: 10 },
  heroBadge: { background: 'rgba(255,255,255,0.1)', color: 'white', padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 },
  searchWrap: { position: 'relative', width: 340, flexShrink: 0 },
  searchIcon: { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' },
  searchInput: { width: '100%', padding: '13px 16px 13px 44px', borderRadius: 50, border: 'none', fontSize: 15, outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  featuredStrip: { display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 },
  featuredBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 20px', borderRadius: 16, border: 'none', cursor: 'pointer', minWidth: 80, transition: 'all 0.2s' },
  catRow: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  catBtn: { padding: '7px 18px', borderRadius: 50, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', color: '#6B7280' },
  catBtnActive: { background: '#E8391D', borderColor: '#E8391D', color: 'white' },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#1A1D2E', display: 'flex', alignItems: 'center', gap: 10 },
  dishCount: { fontSize: 13, fontWeight: 500, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 10px', borderRadius: 50 },
  offlineBadge: { fontSize: 12, color: '#92400E', background: '#FEF3C7', padding: '4px 12px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 5 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  dishCard: { overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  dishImgWrap: { position: 'relative', height: 185 },
  dishImg: { width: '100%', height: '100%', objectFit: 'cover' },
  catBadge: { position: 'absolute', top: 10, left: 10 },
  popularBadge: { position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 50 },
  dishBody: { padding: '16px' },
  dishName: { fontSize: 16, fontWeight: 700, marginBottom: 5, color: '#1A1D2E' },
  dishDesc: { fontSize: 13, color: '#9CA3AF', marginBottom: 12, lineHeight: 1.5, height: 38, overflow: 'hidden' },
  dishFooter: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' },
  dishPrice: { fontSize: 20, fontWeight: 700, color: '#E8391D', display: 'block' },
  rating: { display: 'flex', alignItems: 'center', marginTop: 2 },
  empty: { padding: '60px 20px' },
};
