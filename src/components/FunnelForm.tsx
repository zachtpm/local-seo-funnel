'use client';

import { useFormContext, FUNNEL_FIELDS } from './FormContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FieldRenderer } from './fields/FieldRenderer';
import { SuccessScreen } from './fields/SuccessScreen';

export function FunnelForm() {
  const { currentFieldIndex, totalFields, isSubmitted } = useFormContext();
  const progress = ((currentFieldIndex + 1) / totalFields) * 100;

  if (isSubmitted) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF4FF] via-white to-white">
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Logo */}
      <div className="pt-8 pb-4 px-4">
        <img
          src="/logo.svg"
          alt="Touchpoint Media"
          className="h-8 sm:h-10 w-auto mx-auto"
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center px-4 pb-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="w-full max-w-[440px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFieldIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <FieldRenderer />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Trust badge */}
      <div className="fixed bottom-0 left-0 right-0 pb-6 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <p className="text-center text-gray-400 text-sm flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure & Private
        </p>
      </div>
    </div>
  );
}
