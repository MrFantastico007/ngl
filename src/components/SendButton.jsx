import { motion } from 'framer-motion';

export default function SendButton({ onClick, isLoading, text = 'Send' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-ngl-black text-white rounded-[1.5rem] py-4 font-bold text-xl sm:text-2xl hover:bg-black transition-colors relative overflow-hidden flex items-center justify-center shadow-lg"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-3">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"
          />
        </span>
      ) : (
        text
      )}
    </motion.button>
  );
}
