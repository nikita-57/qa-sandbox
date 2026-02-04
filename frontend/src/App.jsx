import React, { useEffect, useState } from 'react';
import api from './api';
import { ShoppingCart, Trash2, Edit2, Zap, ShieldCheck, PlusCircle, Lock, LogOut } from 'lucide-react';

function App() {
  const [editingId, setEditingId] = useState(null); // null = create, ID = edit existing
  const [isPending, setIsPending] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleDelete = async (id) => {
    const token = localStorage.getItem('cyber_token');
    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts(); // Refresh list after deletion
    } catch (err) {
      alert("Failed to delete: no access or server error");
    }
  };
  // Prefill form for editing
  const startEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price ?? ''));
    setDesc(product.description);
    setImageUrl(product.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll to form
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setName(''); setPrice(''); setDesc(''); setImageUrl('');
  };
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Product fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = () => {
    api.get('/products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Fetch error:", err));
  };

  // Price input: only positive integers
  const handlePriceChange = (e) => {
    const value = e.target.value;
    const allowed = /^\\d*$/;
    if (value === '' || allowed.test(value)) {
      setPrice(value);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('cyber_token');
    if (token) setIsLoggedIn(true);
    fetchProducts();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData);
      localStorage.setItem('cyber_token', res.data.access_token);
      setIsLoggedIn(true);
      setEmail(''); setPassword('');
    } catch (err) {
      alert("Error: unauthorized");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cyber_token');
    setIsLoggedIn(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cyber_token');
    const numericPrice = parseInt(price, 10);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      alert("Price must be a positive integer");
      return;
    }

    const payload = { name, price: numericPrice, description: desc, image_url: imageUrl || null };

    try {
      if (editingId) {
        // In edit mode: send PUT
        await api.put(`/products/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Otherwise: send POST
        await api.post('/products/', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      cancelEdit(); // Clear form
      fetchProducts(); // Refresh list
    } catch (err) {
      alert("Data transmission error");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 w-80 h-80 bg-cyber-blue/30 blur-3xl rounded-full"></div>
        <div className="absolute right-0 top-20 w-96 h-96 bg-cyber-pink/20 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_55%)]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-12">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse"></span>
              Online store
            </p>
            <div className="flex items-baseline gap-3 mt-2">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
                URBAN<span className="text-cyber-blue font-black">MARKET</span>
              </h1>
              <span className="text-cyber-pink font-mono text-xs border border-cyber-pink/60 px-2 py-1 uppercase tracking-[0.2em] rounded-sm bg-cyber-dark/60">
                v1.2
              </span>
            </div>
            <p className="text-sm text-white/70 mt-3 max-w-2xl">
              A curated mix of gadgets and accessories with fast delivery and trusted suppliers.
            </p>
            <a
              href="http://94.228.120.6:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-xs font-mono text-cyber-blue hover:text-white border border-cyber-blue/40 hover:border-cyber-blue px-3 py-2 rounded-md bg-white/5 hover:bg-cyber-blue/20 transition-all"
            >
              Swagger API docs → http://94.228.120.6:8000/docs
            </a>
          </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-xs font-mono flex items-center gap-2">
                  <Zap size={14} className="text-cyber-blue" /> Online
                </span>
                <span className="px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-xs font-mono flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" /> Secure connection
                </span>
              </div>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs border border-cyber-pink px-4 py-2 text-cyber-pink hover:bg-cyber-pink hover:text-black transition-all font-mono rounded-lg shadow-[0_0_18px_rgba(255,0,255,0.15)]"
              >
                <LogOut size={14} /> Log out
              </button>
            ) : (
              <div className="flex items-center gap-2 text-cyber-blue/80 font-mono text-xs">
                <Lock size={14} /> Authorized users only
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-10">
          {!isLoggedIn ? (
            /* LOGIN FORM */
            <section className="max-w-lg mx-auto p-10 border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-cyber-pink/10 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                  <Lock size={18} className="text-cyber-blue" />
                  Sign in
                </h2>
                <span className="text-[11px] font-mono text-white/60 uppercase tracking-[0.3em]">Secure sign-in</span>
              </div>
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-white/50 font-mono">Email</label>
                  <input
                    type="email"
                    placeholder="you@gridmail.io"
                    className="bg-black/60 border border-white/10 p-3 focus:border-cyber-blue outline-none font-mono text-sm transition-all rounded-lg"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-white/50 font-mono">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    className="bg-black/60 border border-white/10 p-3 focus:border-cyber-blue outline-none font-mono text-sm transition-all rounded-lg"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyber-blue to-cyber-pink text-black font-black py-4 rounded-lg hover:shadow-[0_15px_45px_rgba(0,243,255,0.25)] uppercase tracking-[0.25em] transition-all"
                >
                  Sign in
                </button>
              </form>
            </section>
          ) : (
            /* ADMIN FORM */
            <section className="p-8 border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <h2 className="text-lg font-semibold flex items-center gap-3">
                  {editingId ? <Edit2 size={18} className="text-cyber-blue" /> : <PlusCircle size={18} className="text-cyber-pink" />}
                  {editingId ? `Update product #${editingId}` : 'Add product'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-mono">Name</label>
                  <input
                    type="text" placeholder="e.g., wireless headphones"
                    className="bg-black/60 border border-white/10 p-3 focus:border-cyber-blue outline-none text-sm rounded-lg"
                    value={name} onChange={(e) => setName(e.target.value)} required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-mono">Price ($)</label>
                  <input
                    type="number" inputMode="numeric" min="0" step="1" pattern="\\d*" placeholder="1200"
                    className="bg-black/60 border border-white/10 p-3 focus:border-cyber-blue outline-none text-sm rounded-lg"
                    value={price} onChange={handlePriceChange} required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-mono">Description</label>
                  <input
                    type="text" placeholder="Short features, materials, etc." 
                    className="bg-black/60 border border-white/10 p-3 focus:border-cyber-blue outline-none text-sm rounded-lg"
                    value={desc} onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-3">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-mono">Image URL (from media storage)</label>
                  <input
                    type="url"
                    placeholder="https://cdn.example.com/products/headphones.jpg"
                    className="bg-black/60 border border-white/10 p-3 focus:border-cyber-blue outline-none text-sm rounded-lg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value.trim())}
                  />
                  {imageUrl ? (
                    <div className="mt-2 rounded-lg border border-white/10 bg-black/40 overflow-hidden flex items-center gap-4 p-3">
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-white/5 border border-white/5">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
                        />
                      </div>
                      <p className="text-xs text-white/60">Preview fetched from the provided URL.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">Leave empty to use a placeholder.</p>
                  )}
                </div>

                <div className="md:col-span-3 flex flex-col md:flex-row gap-4">
                  <button
                    disabled={isPending}
                  className={`flex-1 py-4 font-black tracking-[0.3em] transition-all rounded-lg border ${isPending ? 'bg-gray-800 border-gray-700' :
                      editingId ? 'border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black' : // Blue style for edit
                        'border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-black' // Pink for create
                      }`}
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : editingId ? 'Save changes' : 'Create product'}
                  </button>

                  {/* Cancel button shown only while editing */}
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="py-4 px-8 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all font-mono text-xs uppercase rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}


          {/* Inventory visible only when logged in */}
          {isLoggedIn && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50 font-mono">Catalog</p>
                  <h3 className="text-xl font-semibold mt-1">Products available</h3>
                </div>
                <span className="text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60">
                  {products.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="relative bg-[#0d111a]/80 border border-white/10 p-6 rounded-xl backdrop-blur-lg hover:border-cyber-blue/50 transition-all shadow-[0_18px_60px_rgba(0,0,0,0.35)] flex flex-col h-full overflow-hidden group"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"></div>
                    <div className="mb-4 rounded-lg overflow-hidden border border-white/5 bg-white/5">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-40 object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x300?text=Image+not+found'; }}
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-r from-cyber-blue/20 via-white/5 to-cyber-pink/20 flex items-center justify-center text-xs text-white/50 font-mono">
                          No image provided
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {product.name}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-1 rounded-full border border-cyber-blue/40 text-cyber-blue bg-cyber-blue/10">
                        ID {product.id}
                      </span>
                    </div>

                    <p className="text-white/60 text-sm mt-3 mb-6 leading-relaxed min-h-[48px]">
                      {product.description || 'No description'}
                    </p>

                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between border border-white/5 rounded-lg px-4 py-3 bg-white/5">
                        <div className="flex items-center gap-2 text-sm font-mono text-white/70">
                          <Zap size={14} className="text-cyber-blue" />
                          Price
                        </div>
                        <div className="text-2xl font-black text-cyber-blue">
                          {product.price}
                          <span className="text-xs ml-1 opacity-60">$</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isLoggedIn && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-900/30 hover:bg-red-600 p-2 text-red-400 hover:text-white transition-all border border-red-500/40 rounded-lg shrink-0"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {/* Edit button */}
                    <button
                      onClick={() => startEdit(product)}
                      className="bg-blue-900/30 hover:bg-cyber-blue/70 p-2 text-cyber-blue hover:text-black transition-all border border-cyber-blue/40 rounded-lg shrink-0"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-white/10 via-white/5 to-white/10 hover:from-cyber-pink hover:via-cyber-blue hover:to-cyber-pink p-3 transition-all text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-white/10 rounded-lg hover:text-black hover:shadow-[0_0_25px_rgba(255,0,128,0.35)]">
                      <ShoppingCart size={14} /> Buy
                    </button>
                  </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
