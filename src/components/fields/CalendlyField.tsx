'use client';

import { useState } from 'react';
import { useFormContext } from '../FormContext';
import { FunnelButton } from './FunnelButton';
import { motion } from 'framer-motion';

export function CalendlyField() {
  const { currentField, formData, prevField, setIsSubmitted } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log('Form Submission:', { ...formData, submittedAt: new Date().toISOString() });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight">
        Start Ranking Top 3
      </h1>
      <p className="text-gray-500 text-center text-base">
        Pick a time that works best for you, {formData.firstName}
      </p>

      {calendlyUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
        >
          <iframe
            src={calendlyUrl}
            width="100%"
            height="500"
            frameBorder="0"
            title="Schedule a consultation"
            className="w-full"
          />
        </motion.div>
      )}

      <div className="text-center py-4">
        <p className="text-gray-400 text-sm mb-4">Or submit your info and we'll contact you</p>
      </div>

      <div className="space-y-3">
        <FunnelButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Get Ranked Free'
          )}
        </FunnelButton>
        <FunnelButton variant="back" onClick={prevField}>
          Back
        </FunnelButton>
      </div>
    </div>
  );
}
