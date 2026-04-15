import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AnimatedInput({ placeholder, type = 'text', value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="relative w-full"
      animate={{ scale: isFocused ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full bg-white/20 border-2 border-white/40 rounded-[1.5rem] px-6 py-4 text-white placeholder:text-white/70 focus:outline-none focus:bg-white/30 transition-all font-bold text-center text-lg"
      />
    </motion.div>
  );
}
