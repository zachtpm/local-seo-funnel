'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../FormContext';
import { FunnelButton } from './FunnelButton';
import { motion } from 'framer-motion';

export function PhoneField() {
  const { currentField, formData, updateFormData, nextField, prevField } = useFormContext();
  const [value, setValue] = useState(formData.userPhone || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const formatPhoneNumber = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatPhoneNumber(e.target.value));
  };

  const handleContinue = () => {
    updateFormData({ userPhone: value.trim() });
    nextField();
  };

  const handleSkip = () => {
    updateFormData({ userPhone: '' });
    nextField();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight">
        {currentField.label}
      </h1>
      <p className="text-gray-500 text-center text-base">
        We may call to confirm your appointment
      </p>

      <motion.input
        ref={inputRef}
        type="tel"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={currentField.placeholder}
        whileFocus={{ scale: 1.01 }}
        className="w-full h-14 px-4 rounded-xl text-lg bg-white border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
      />

      <div className="space-y-3 pt-2">
        <FunnelButton onClick={handleContinue}>
          {value.trim() ? 'Continue' : 'Skip'}
        </FunnelButton>
        <FunnelButton variant="back" onClick={prevField}>
          Back
        </FunnelButton>
      </div>
    </div>
  );
}
