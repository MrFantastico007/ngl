import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SuccessAnimation from '../components/SuccessAnimation';
import SendButton from '../components/SendButton';

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="w-full max-w-[340px] sm:max-w-sm"
      >
        <div className="mb-4">
          <SuccessAnimation />
        </div>
        
        <div className="w-full space-y-4">
          <SendButton 
            text="Send another message" 
            onClick={() => navigate(-1)} 
            isLoading={false} 
          />
          <button 
            onClick={() => navigate('/')}
            className="w-full text-white/70 font-bold py-4 hover:text-white transition-colors text-lg"
          >
            Get your own link
          </button>
        </div>
      </motion.div>
    </div>
  );
}
