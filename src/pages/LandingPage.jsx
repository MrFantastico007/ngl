import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedInput from '../components/AnimatedInput';
import SendButton from '../components/SendButton';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleGo = () => {
    if (username.trim()) {
      navigate(`/message/${username.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full flex flex-col items-center text-center gap-8"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 bg-gradient-to-tr from-ngl-pink to-ngl-orange rounded-[2rem] shadow-2xl shadow-ngl-pink/50 flex items-center justify-center"
        >
          <span className="text-white font-black text-4xl tracking-tighter">ngl</span>
        </motion.div>
        
        <div className="w-full space-y-4">
          <h1 className="text-4xl font-black text-white px-2 tracking-tight leading-tight">Get anonymous messages!</h1>
          <p className="text-white/70 font-semibold">Create a link and share it on your story</p>
        </div>

        <div className="w-full max-w-[340px] sm:max-w-sm space-y-4 mt-6">
          <AnimatedInput 
            placeholder="Enter your username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <SendButton 
            text="Get Messages" 
            onClick={handleGo} 
            isLoading={false} 
          />
        </div>
      </motion.div>
    </div>
  );
}
