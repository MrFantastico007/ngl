import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:1234';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', displayName: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          displayName: form.displayName,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/x7admin');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const shareLink = form.username
    ? `${window.location.origin}/message/${form.username.toLowerCase()}`
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ec1379, #ff4b2b)' }}>
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Create Account</h1>
          <p className="text-white/40 text-sm mt-1">Set up your anonymous message inbox</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Display Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Display name (e.g. Ank GOAT)"
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors font-semibold"
              />
            </div>

            {/* Username */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">@</span>
              <input
                type="text"
                placeholder="username (for your link)"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/\s/g, '_').toLowerCase() }))}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors font-semibold"
              />
            </div>

            {/* Live link preview */}
            {shareLink && (
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-pink-400 font-mono truncate">
                🔗 {shareLink}
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors font-semibold"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirm password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
                className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-colors font-semibold"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm font-semibold">
                ⚠️ {error}
              </div>
            )}

            <motion.button
              type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ec1379, #ff4b2b)' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/x7admin" className="text-pink-400 hover:text-pink-300 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
