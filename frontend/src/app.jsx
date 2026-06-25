import React, { useState, useEffect } from 'react';
import './App.css'; 

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('zara_user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 

  const [isRegister, setIsRegister] = useState(false);
  const [username, setAuthUsername] = useState('');
  const [password, setAuthPassword] = useState('');
  const [regRole, setRegRole] = useState('customer');
  const [view, setView] = useState(user?.role === 'admin' ? 'admin-dashboard' : 'shop'); 
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [flowerType, setFlowerType] = useState('');
  const [wrapColor, setWrapColor] = useState('Pink');
  const [customNotes, setCustomNotes] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? 'register' : 'login';
    const bodyData = isRegister ? { username, password, role: regRole } : { username, password };
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (res.ok) {
        if (isRegister) { alert("Registration Successful!"); setIsRegister(false); }
        else { setUser(data); localStorage.setItem('zara_user', JSON.stringify(data)); setView(data.role === 'admin' ? 'admin-dashboard' : 'shop'); }
      } else { alert(data.error); }
    } catch (err) { alert("Server error!"); }
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('zara_user'); window.location.reload(); };

  const fetchProducts = async () => {
    try { const res = await fetch('http://127.0.0.1:5000/api/products');
      if (res.ok) { const data = await res.json(); setProducts(data); if(data.length > 0) setFlowerType(data[0].name); }
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try { const res = await fetch(`http://127.0.0.1:5000/api/orders?userId=${user.username}&role=${user.role}`);
      if (res.ok) { const data = await res.json(); setOrders(data); }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProducts(); if (user) fetchOrders(); }, [user]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const productData = { name: pName, price: Number(pPrice), image: pImage, desc: pDesc };
    try {
      await fetch('http://127.0.0.1:5000/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
      alert("Product Added!"); setPName(''); setPPrice(''); setPImage(''); setPDesc(''); fetchProducts();
    } catch (err) { alert("Error"); }
  };

  const handleBuyProduct = async (product) => {
    const orderData = { userId: user.username, username: user.username, flowerType: product.name, wrapColor: 'Standard', customNotes: 'Direct Buy', price: product.price };
    try {
      await fetch('http://127.0.0.1:5000/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
      alert("Order Placed!"); setSelectedProduct(null); fetchOrders();
    } catch (err) { alert("Error"); }
  };

  const handleSaveCustomOrder = async () => {
    const selectedProd = products.find(p => p.name === flowerType);
    const orderData = { userId: user.username, username: user.username, flowerType, wrapColor, customNotes, price: selectedProd ? selectedProd.price + 200 : 1500 };
    try {
      await fetch('http://127.0.0.1:5000/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
      alert("Order Sent!"); setCustomNotes(''); fetchOrders();
    } catch (err) { alert("Error"); }
  };

  const handleDeleteOrder = async (id) => { await fetch(`http://127.0.0.1:5000/api/orders/${id}`, { method: 'DELETE' }); fetchOrders(); };
  const handleDeleteProduct = async (id) => { await fetch(`http://127.0.0.1:5000/api/products/${id}`, { method: 'DELETE' }); fetchProducts(); };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fffdfa' }}>
        <form onSubmit={handleAuth} style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '320px', border: '1px solid #fbcfe8' }}>
          <h2 style={{ color: '#db8d27', textAlign: 'center' }}>🌸 {isRegister ? 'Register' : 'Login'} to Zara</h2>
          <input type="text" placeholder="Username" required value={username} onChange={(e) => setAuthUsername(e.target.value)} style={{ width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setAuthPassword(e.target.value)} style={{ width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          {isRegister && <select value={regRole} onChange={(e) => setRegRole(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}><option value="customer">Customer</option><option value="admin">Admin</option></select>}
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#db9f27', color: '#fff', border: 'none', borderRadius: '8px' }}>{isRegister ? 'Sign Up' : 'Sign In'}</button>
          <p onClick={() => setIsRegister(!isRegister)} style={{ textAlign: 'center', cursor: 'pointer', color: '#6b7280', fontSize: '13px', marginTop: '15px' }}>{isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}</p>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.logo}>🌸 Zara Handmade</div>
        <div style={styles.navLinks}>
          {user.role === 'customer' && (
            <>
              <button onClick={() => setView('shop')} style={styles.navBtn}>Shop</button>
              <button onClick={() => setView('custom-order')} style={styles.navBtn}>Custom Bouquet</button>
              <button onClick={() => setView('my-orders')} style={styles.navBtn}>My Orders</button>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <button onClick={() => setView('admin-dashboard')} style={{...styles.navBtn, color: '#db8a27'}}>📊 Orders</button>
              <button onClick={() => setView('admin-products')} style={{...styles.navBtn, color: '#db9c27'}}>🛍️ Products</button>
            </>
          )}
          <button onClick={handleLogout} style={{ backgroundColor: '#efbf44', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      {/* Shop View with Modal */}
      {view === 'shop' && user.role === 'customer' && (
        <section style={{ padding: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {products.map(p => (
              <div key={p._id} className="product-card" onClick={() => setSelectedProduct(p)}>
                <img src={p.image} alt={p.name} className="product-image" />
                <h3>{p.name}</h3>
                <p style={{ color: '#db8a27', fontWeight: 'bold' }}>Rs. {p.price}.00</p>
                <button className="buy-btn">View Details</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal Popup */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setSelectedProduct(null)}>&times;</span>
            <img src={selectedProduct.image} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '15px' }} />
            <h2 style={{ color: '#db8d27' }}>{selectedProduct.name}</h2>
            <p>{selectedProduct.desc}</p>
            <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '15px 0' }}>Rs. {selectedProduct.price}.00</div>
            <button className="buy-btn" onClick={() => handleBuyProduct(selectedProduct)}>Add to Cart 🛒</button>
          </div>
        </div>
      )}

      {/* Other Views (Custom, Orders, Admin) - ඔයාගේ මුල් කෝඩ් එකේ විදියටම */}
      {view === 'custom-order' && (
  <section style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#db9327', textAlign: 'center', marginBottom: '20px' }}>Create Your Bouquet 🌸</h2>
      
      {/* Flower Selection */}
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Choose Flower Type</label>
      <select 
        value={flowerType} 
        onChange={(e) => setFlowerType(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #fbcfe8', marginBottom: '20px' }}
      >
        <option value="Roses">Roses</option>
        <option value="Lilies">Lilies</option>
        <option value="Tulips">Tulips</option>
      </select>

      {/* Wrap Color (Modern Radio Buttons) */}
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Wrapper Color</label>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        {['Pink', 'White', 'Blue', 'Gold'].map((color) => (
          <label key={color} style={{ cursor: 'pointer', border: wrapColor === color ? '2px solid #db7b27' : '1px solid #ddd', padding: '8px 16px', borderRadius: '20px' }}>
            <input type="radio" name="wrap" value={color} checked={wrapColor === color} onChange={(e) => setWrapColor(e.target.value)} style={{ display: 'none' }} />
            {color}
          </label>
        ))}
      </div>

      {/* Custom Notes */}
      <textarea 
        placeholder="Add special instructions or occasion details..."
        value={customNotes}
        onChange={(e) => setCustomNotes(e.target.value)}
        style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #fbcfe8', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      <button 
        onClick={handleSaveCustomOrder}
        style={{ width: '100%', padding: '15px', backgroundColor: '#db8427', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Place Custom Order ✨
      </button>
    </div>
  </section>
)}
      {view === 'my-orders' && (
  <section style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
    <h2 style={{ color: '#db2777', textAlign: 'center', marginBottom: '30px' }}>📦 Your Order History</h2>
    
    {orders.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
        <p style={{ fontSize: '40px' }}>🌸</p>
        <p>No orders placed yet. Start shopping!</p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((o) => (
          <div 
            key={o._id} 
            style={{ 
              backgroundColor: '#fff', 
              padding: '25px', 
              borderRadius: '16px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              borderLeft: '5px solid #db7827' 
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>💐 {o.flowerType}</h3>
              <p style={{ margin: '2px 0', fontSize: '14px', color: '#6b7280' }}>
                Wrapper: <span style={{ fontWeight: 'bold' }}>{o.wrapColor}</span>
              </p>
              <p style={{ margin: '2px 0', fontSize: '13px', fontStyle: 'italic', color: '#9ca3af' }}>
                Note: {o.customNotes || "No notes"}
              </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#db8a27', marginBottom: '5px' }}>
                Rs. {o.price}.00
              </div>
              <span style={{ 
                padding: '5px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                backgroundColor: '#fce7f3', 
                color: '#db2777',
                fontWeight: 'bold'
              }}>
                Processing
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}
      {view === 'admin-dashboard' && user.role === 'admin' && (
  <section style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
      <h2 style={{ color: '#1f2937', margin: 0 }}>📊 Order Management</h2>
      <div style={{ backgroundColor: '#fce7f3', padding: '10px 20px', borderRadius: '12px', color: '#db2777', fontWeight: 'bold' }}>
        Total Orders: {orders.length}
      </div>
    </div>

    {orders.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '16px', border: '1px dashed #db2777' }}>
        <p style={{ color: '#6b7280' }}>No pending orders at the moment.</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: '15px' }}>
        {orders.map((o) => (
          <div 
            key={o._id} 
            style={{ 
              backgroundColor: '#fff', 
              padding: '20px', 
              borderRadius: '16px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              border: '1px solid #f3f4f6'
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: '#fce7f3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                💐
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{o.flowerType}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  By: <strong>{o.username}</strong> | Wrap: {o.wrapColor}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#db8d27', marginBottom: '8px' }}>Rs. {o.price}.00</div>
              <button 
                onClick={() => handleDeleteOrder(o._id)} 
                style={{ 
                  backgroundColor: '#10b981', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                Mark Complete ✅
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}
      {view === 'admin-products' && user.role === 'admin' && (
  <section style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h2 style={{ color: '#1f2937', marginBottom: '30px' }}>🛍️ Product Management</h2>
    
    {/* Product Add Form */}
    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#dba227' }}>Add New Product</h3>
      <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <input type="text" placeholder="Product Name" required value={pName} onChange={(e)=>setPName(e.target.value)} style={styles.input} />
        <input type="number" placeholder="Price (Rs)" required value={pPrice} onChange={(e)=>setPPrice(e.target.value)} style={styles.input} />
        <input type="url" placeholder="Image URL" value={pImage} onChange={(e)=>setPImage(e.target.value)} style={{ ...styles.input, gridColumn: 'span 2' }} />
        <textarea placeholder="Description" value={pDesc} onChange={(e)=>setPDesc(e.target.value)} style={{ ...styles.input, gridColumn: 'span 2', height: '80px' }} />
        <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', backgroundColor: '#dbae27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Product ✨
        </button>
      </form>
    </div>

    {/* Product List Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
      {products.map(p => (
        <div key={p._id} style={{ background: '#fff', padding: '15px', borderRadius: '16px', border: '1px solid #f3f4f6', textAlign: 'center', transition: '0.3s' }}>
          <img src={p.image} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginBottom: '10px' }} />
          <h4 style={{ margin: '5px 0' }}>{p.name}</h4>
          <p style={{ color: '#db9027', fontWeight: 'bold', margin: '5px 0' }}>Rs. {p.price}.00</p>
          <button onClick={() => handleDeleteProduct(p._id)} style={{ backgroundColor: '#fee2e2', color: '#efa244', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}>
            Delete 🗑️
          </button>
        </div>
      ))}
    </div>
  </section>
)}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#FDFBF7', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", margin: 0, padding: 0, color: '#4A3728' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  logo: { fontSize: '22px', fontWeight: 'bold', color: '#6F4E37' }, // Coffee Brown
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  navBtn: { background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#6F4E37' },
  // Buttons and Accents
  primaryBtn: { backgroundColor: '#8B5E3C', color: '#FFFFFF', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #F0ECE2' }
};

export default App;

