import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';
import { useEffect } from 'react';

export default function SuccessAnimation() {
  useEffect(() => {
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#FF007F', '#FF3C3C', '#8000FF'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full h-full min-h-[300px]">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] mb-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3, type: 'spring' }}
        >
          <Check strokeWidth={5} className="w-12 h-12 text-ngl-pink" />
        </motion.div>
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-white text-3xl font-black mb-2 tracking-tight"
      >
        Sent!
      </motion.h2>
    </div>
  );
}
