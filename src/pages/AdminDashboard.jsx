import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, Trash2, RefreshCw, LogOut,
  Globe, Smartphone, Monitor, MessageCircle, Link2, Shield
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:1234';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function useAuth() {
  const token = localStorage.getItem('ngl_token');
  const username = localStorage.getItem('ngl_username');
  const displayName = localStorage.getItem('ngl_displayName');
  return { token, username, displayName };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, username, displayName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const shareLink = username ? `${window.location.origin}/message/${username}` : '';

  // Redirect if not logged in
  useEffect(() => {
    if (!token || !username) navigate('/x7admin');
  }, [token, username, navigate]);

  const fetchMessages = useCallback(async () => {
    if (!token || !username) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      if (data.success) setMessages(data.messages);
      else setError(data.error || 'Failed to load messages');
    } catch {
      setError('Cannot reach server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [token, username]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const logout = () => {
    localStorage.removeItem('ngl_token');
    localStorage.removeItem('ngl_username');
    localStorage.removeItem('ngl_displayName');
    navigate('/x7admin');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteMessage = async (id) => {
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch {
      alert('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ec1379, #ff4b2b)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">{displayName}</h1>
              <p className="text-white/40 text-xs font-semibold">@{username}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors font-bold text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {/* ─── Share Link Card ─── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-pink-400" />
            <p className="text-white/60 font-bold text-sm uppercase tracking-widest">Your Share Link</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 font-mono text-pink-300 text-sm truncate">
              {shareLink}
            </div>
            <motion.button onClick={copyLink} whileTap={{ scale: 0.9 }}
              className="px-5 py-3 rounded-2xl font-bold flex items-center gap-2 text-white shrink-0 transition-all"
              style={{ background: copied ? '#22c55e22' : 'linear-gradient(135deg, #ec1379, #ff4b2b)' }}>
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>
          <p className="text-white/30 text-xs mt-3 font-semibold">
            📱 Post this link on your Instagram story, WhatsApp status, or anywhere!
          </p>
        </motion.div>

        {/* ─── Stats + Refresh ─── */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-lg">
              {loading ? '...' : messages.length}
            </span>
            <span className="text-white/40 font-semibold text-sm">
              {messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>
          <button onClick={fetchMessages} disabled={loading}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors font-bold text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ─── Error ─── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4 text-red-300 font-bold text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ─── Empty State ─── */}
        {!loading && messages.length === 0 && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-black text-xl">No messages yet</p>
            <p className="text-white/20 text-sm mt-2">Share your link to start receiving messages!</p>
          </motion.div>
        )}

        {/* ─── Message Cards ─── */}
        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={msg._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -80, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg hover:bg-white/8 transition-colors"
              >
                {/* Message text */}
                <p className="text-white font-black text-xl mb-4 leading-snug">
                  "{msg.text}"
                </p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs font-semibold mb-4">
                  <MetaRow icon="🕐" label={formatDate(msg.createdAt)} />
                  <MetaRow icon="🌐" label={`IP: ${msg.sender?.ip || 'Unknown'}`} />
                  <MetaRow
                    icon={<Globe className="inline w-3 h-3 mr-1" />}
                    label={[msg.sender?.city, msg.sender?.region, msg.sender?.country].filter(v => v && v !== 'Unknown').join(', ') || 'Unknown location'}
                  />
                  <MetaRow
                    icon={msg.sender?.device === 'mobile' || msg.sender?.device === 'tablet'
                      ? <Smartphone className="inline w-3 h-3 mr-1" />
                      : <Monitor className="inline w-3 h-3 mr-1" />}
                    label={msg.sender?.device || 'desktop'}
                  />
                  <MetaRow icon="🖥" label={`${msg.sender?.browser || '?'} / ${msg.sender?.os || '?'}`} />
                  <MetaRow icon="🗣" label={msg.sender?.language?.split(',')[0] || 'Unknown'} />
                  {msg.sender?.timezone && msg.sender.timezone !== 'Unknown' && (
                    <MetaRow icon="⏰" label={msg.sender.timezone} />
                  )}
                </div>

                {/* Delete */}
                <div className="flex justify-end">
                  <button onClick={() => deleteMessage(msg._id)} disabled={deleting === msg._id}
                    className="flex items-center gap-1.5 text-white/20 hover:text-red-400 transition-colors font-bold text-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting === msg._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

function MetaRow({ icon, label }) {
  return (
    <span className="text-white/50 flex items-center gap-1 truncate">
      {typeof icon === 'string' ? <span>{icon}</span> : icon}
      <span className="truncate">{label}</span>
    </span>
  );
}
