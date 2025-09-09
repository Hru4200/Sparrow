import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Plus, Sparkles } from 'lucide-react';

interface WelcomeAnimationProps {
  credits: number;
  onComplete: () => void;
  theme: 'dark' | 'light';
}

export default function WelcomeAnimation({ credits, onComplete, theme }: WelcomeAnimationProps) {
  const [stage, setStage] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('display'), 500);
    const timer2 = setTimeout(() => setStage('exit'), 2500);
    const timer3 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'exit' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: stage === 'enter' ? [0, 1.2, 1] : 1,
              opacity: 1 
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: stage === 'enter' ? 0.6 : 0.3,
              ease: "easeOut"
            }}
            className="relative"
          >
            {/* Main Badge */}
            <div className="flex items-center space-x-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-6 rounded-full shadow-2xl">
              <div className="relative">
                <Coins className="h-10 w-10" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                >
                  <Plus className="h-4 w-4 text-white" />
                </motion.div>
              </div>
              <div className="text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-3xl font-bold"
                >
                  +{credits}
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-lg font-medium"
                >
                  Welcome Credits!
                </motion.div>
              </div>
            </div>
            
            {/* Sparkle Effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.1 * i,
                    repeat: 1,
                    ease: "easeInOut"
                  }}
                  className="absolute"
                  style={{
                    left: `${20 + (i % 4) * 20}%`,
                    top: `${20 + Math.floor(i / 4) * 20}%`,
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </motion.div>
              ))}
            </div>

            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{ 
                    y: 0, 
                    x: 0, 
                    opacity: 1,
                    rotate: 0
                  }}
                  animate={{ 
                    y: [-20, 100],
                    x: [0, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.5 + Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'][i % 5],
                    left: `${45 + Math.random() * 10}%`,
                    top: '50%'
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}