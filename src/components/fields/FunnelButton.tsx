'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FunnelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'back';
  className?: string;
}

export function FunnelButton({ onClick, disabled, children, variant = 'primary', className }: FunnelButtonProps) {
  if (variant === 'back') {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full py-3 px-6 rounded-xl text-gray-500 font-medium text-base',
          'transition-colors duration-200 hover:text-gray-700 hover:bg-gray-100',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        'w-full py-4 px-6 rounded-xl font-semibold text-lg text-white',
        'bg-gradient-to-r from-[#2563EB] to-[#7C3AED]',
        'shadow-lg shadow-blue-500/25',
        'transition-all duration-200',
        'hover:shadow-xl hover:shadow-blue-500/30',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg',
        className
      )}
    >
      {children}
    </motion.button>
  );
}
