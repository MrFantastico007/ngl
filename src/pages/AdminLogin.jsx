import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:1234';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ngl_token', data.token);
        localStorage.setItem('ngl_username', data.username);
        localStorage.setItem('ngl_displayName', data.displayName);
        navigate('/x7admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ec1379, #ff4b2b)' }}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Admin Portal</h1>
          <p className="text-white/40 text-sm mt-1">Restricted access</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors font-semibold"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors font-semibold"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #ec1379, #ff4b2b)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            No account?{' '}
            <Link to="/x7admin/register" className="text-pink-400 hover:text-pink-300 font-bold transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
