import { motion } from 'framer-motion';

export default function MessageCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-[2rem] p-6 sm:p-8 max-w-[340px] sm:max-w-sm w-full mx-auto relative overflow-hidden flex flex-col gap-6 ${className}`}
    >
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-ngl-orange via-ngl-pink to-ngl-purple" />
      {children}
    </motion.div>
  );
}
