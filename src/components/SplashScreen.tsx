import { motion } from 'motion/react';
import { Wallet } from 'lucide-react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2 }}
      onAnimationComplete={onComplete}
      className="absolute inset-0 bg-emerald-600 flex flex-col items-center justify-center z-[100] p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex flex-col items-center text-center"
      >
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-2xl mb-4 sm:mb-6">
          <Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Mandal Khata</h1>
        <p className="text-emerald-100 text-xs sm:text-sm tracking-widest uppercase opacity-80">Digital Udhaar Manager</p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-10 text-emerald-200 text-xs"
      >
        Secure & Simple
      </motion.div>
    </motion.div>
  );
}
