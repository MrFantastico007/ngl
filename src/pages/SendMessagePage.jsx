import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dice3, Lock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:1234';

export default function SendMessagePage() {
  const { username = 'ank_goat' } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [tappers] = useState(() => Math.floor(Math.random() * 500) + 100);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      // ─── Collect device info using multiple methods ───
      let deviceModel = '';
      let devicePlatform = '';

      // Method 1: User-Agent Client Hints API (best — returns real model like "moto g73 5G")
      try {
        if (navigator.userAgentData?.getHighEntropyValues) {
          const hints = await navigator.userAgentData.getHighEntropyValues([
            'model', 'platform', 'platformVersion', 'fullVersionList', 'mobile'
          ]);
          deviceModel = hints.model || '';
          devicePlatform = `${hints.platform || ''} ${hints.platformVersion || ''}`.trim();
        }
      } catch (e) {
        console.warn('Client Hints failed:', e);
      }

      // Method 2: Fallback — parse the device model from the raw UA string
      // Chrome reduces Android UA to "K", but some browsers still expose the real model
      if (!deviceModel) {
        try {
          const ua = navigator.userAgent || '';
          // Match patterns like "moto g73 5G Build/" or "SM-G991B Build/" or "Pixel 7 Build/"
          const androidModelMatch = ua.match(/;\s*([^;)]+?)\s*Build\//i);
          if (androidModelMatch && androidModelMatch[1]) {
            const model = androidModelMatch[1].trim();
            // Filter out generic/useless values
            if (model.length > 1 && model !== 'K' && model !== 'wv') {
              deviceModel = model;
            }
          }
          // For iOS devices
          if (!deviceModel) {
            if (/iPhone/.test(ua)) deviceModel = 'iPhone';
            else if (/iPad/.test(ua)) deviceModel = 'iPad';
          }
        } catch { /* ignore */ }
      }

      // Method 3: Use userAgentData brands as last resort
      if (!deviceModel && navigator.userAgentData) {
        try {
          const data = navigator.userAgentData;
          if (data.mobile) deviceModel = 'Mobile Device';
          if (!devicePlatform) devicePlatform = data.platform || '';
        } catch { /* ignore */ }
      }

      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          text: message.trim(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          deviceModel,      // e.g. "moto g73 5G"
          devicePlatform,   // e.g. "Android 14"
          screenRes: `${screen.width}x${screen.height}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/success');
      } else {
        setError('Failed to send. Please try again.');
      }
    } catch {
      setError('Cannot reach the server. Make sure the backend is running.');
    } finally {
      setIsSending(false);
    }
  };

  const handleRandomMsg = () => {
    const msgs = [
      'how tall r u', 'What is your secret?', 'Best memory?',
      'What do you think of me?', 'rate me 1-10 honestly',
      'Tell me something you\'ve never told anyone',
    ];
    setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen pt-[12vh] px-4 pb-8 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ec1379 0%, #ff4b2b 100%)' }}
    >
      <div className="w-full max-w-[360px] z-10 flex flex-col items-center">

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[2rem] overflow-hidden shadow-2xl flex flex-col mb-4"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          {/* Profile Header */}
          <div className="bg-white px-5 py-4 flex items-center gap-4 rounded-b-[2rem] shadow-md">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
              alt="Avatar"
              className="w-14 h-14 rounded-full bg-gray-100 shrink-0"
            />
            <div>
              <h2 className="text-lg font-black text-black leading-tight">@{username}</h2>
              <p className="text-black font-extrabold text-sm leading-tight">send me anonymous messages!</p>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative h-[200px] -mt-5 pt-8">
            <textarea
              className="w-full h-full bg-transparent text-white font-black text-2xl p-6 resize-none focus:outline-none placeholder:text-white/30"
              placeholder="Send me anonymous messages..."
              value={message}
              onChange={(e) => setMessage(e.target.value.substring(0, 300))}
            />
            <button
              onClick={handleRandomMsg}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white shadow"
              style={{ background: 'rgba(255,255,255,0.25)' }}
            >
              <Dice3 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Lock row */}
        <div className="flex items-center gap-1.5 text-white/90 font-bold text-sm mb-5">
          <Lock className="w-3.5 h-3.5 text-yellow-300" />
          <span>anonymous q&a</span>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full bg-black/30 border border-white/20 rounded-2xl p-3 mb-3 text-white text-sm font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Send Button */}
        <motion.button
          whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
          onClick={handleSend} disabled={isSending || !message.trim()}
          className="w-full bg-black text-white rounded-[1.5rem] py-4 font-extrabold text-2xl shadow-lg tracking-tight disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {isSending ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"
            />
          ) : 'Send!'}
        </motion.button>

        {/* Bottom CTA */}
        <div className="mt-28 w-full flex flex-col items-center">
          <p className="text-white font-bold text-sm mb-3 text-center">
            👇 {tappers} friends just tapped the button 👇
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full bg-black text-white rounded-[1.5rem] py-4 font-extrabold text-xl shadow-lg"
          >
            Get your own messages!
          </motion.button>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-4 text-white/50 text-xs font-bold">
          <a href="#" className="hover:text-white/80 transition-colors">Terms</a>
          <a href="#" className="hover:text-white/80 transition-colors">Privacy</a>
        </div>
      </div>
    </div>
  );
}
