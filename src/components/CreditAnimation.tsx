import React, { useEffect, useState } from 'react';
import { Coins, Plus } from 'lucide-react';

interface CreditAnimationProps {
  credits: number;
  onComplete: () => void;
  theme: 'dark' | 'light';
}

export default function CreditAnimation({ credits, onComplete, theme }: CreditAnimationProps) {
  const [stage, setStage] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('display'), 200);
    const timer2 = setTimeout(() => setStage('exit'), 2000);
    const timer3 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`credit-animation-container ${stage}`}>
        <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-full shadow-2xl">
          <div className="relative">
            <Coins className="h-8 w-8" />
            <Plus className="h-4 w-4 absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">+{credits}</div>
            <div className="text-sm font-medium">Credits Added!</div>
          </div>
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full sparkle"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}