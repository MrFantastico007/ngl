import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Trash2, MessageCircle, Globe, Smartphone, Monitor, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:1234';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function DeviceIcon({ device }) {
  if (device === 'mobile' || device === 'tablet') return <Smartphone className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
}

export default function Dashboard() {
  const { username = 'ank_goat' } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const shareLink = `${window.location.origin}/message/${username}`;

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/messages/${username}`);
      const data = await res.json();
      if (data.success) setMessages(data.messages);
      else setError('Failed to load messages.');
    } catch {
      setError('Cannot connect to backend. Make sure `node server.mjs` is running in the backend folder.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [username]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteMessage = async (id) => {
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/api/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch {
      alert('Failed to delete message.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #ec1379 0%, #ff4b2b 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-1">📬 Inbox</h1>
          <p className="text-white/70 font-semibold">@{username}'s anonymous messages</p>
        </motion.div>

        {/* Share Link Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-5 mb-6 shadow-xl">
          <p className="text-white/80 font-bold text-sm mb-2 uppercase tracking-widest">Your Share Link</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3 font-mono text-white text-sm truncate border border-white/20">
              {shareLink}
            </div>
            <button onClick={copyLink}
              className="bg-black text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black/80 transition-colors shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </motion.div>

        {/* Refresh + Count */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-white font-bold">
            {loading ? 'Loading...' : `${messages.length} message${messages.length !== 1 ? 's' : ''}`}
          </span>
          <button onClick={fetchMessages} disabled={loading}
            className="text-white/70 hover:text-white flex items-center gap-1 font-bold text-sm transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-black/30 border border-white/20 rounded-2xl p-4 mb-4 text-white font-bold text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence>
            {!loading && messages.length === 0 && !error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 font-bold text-lg">No messages yet!</p>
                <p className="text-white/40 text-sm mt-1">Share your link to start receiving messages.</p>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div key={msg._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.05 }}
                className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-5 shadow-lg">

                {/* Message Text */}
                <p className="text-white font-black text-xl mb-4 leading-snug">
                  "{msg.text}"
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-white/60 font-semibold mb-4">
                  <span>🕐 {formatDate(msg.createdAt)}</span>
                  <span>🌐 IP: {msg.sender?.ip || 'Unknown'}</span>
                  <span>
                    <Globe className="inline w-3 h-3 mr-1" />
                    {[msg.sender?.city, msg.sender?.region, msg.sender?.country].filter(Boolean).join(', ') || 'Unknown'}
                  </span>
                  <span>
                    <DeviceIcon device={msg.sender?.device} />
                    <span className="ml-1">{msg.sender?.device || 'desktop'}</span>
                  </span>
                  <span>🖥 {msg.sender?.browser || 'Unknown'} on {msg.sender?.os || 'Unknown'}</span>
                  <span>🗣 {msg.sender?.language?.split(',')[0] || 'Unknown'}</span>
                </div>

                {/* Delete Button */}
                <div className="flex justify-end">
                  <button onClick={() => deleteMessage(msg._id)} disabled={deleting === msg._id}
                    className="flex items-center gap-1.5 text-white/50 hover:text-red-300 transition-colors font-bold text-sm">
                    <Trash2 className="w-4 h-4" />
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
