'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../FormContext';
import { FunnelButton } from './FunnelButton';
import { motion } from 'framer-motion';

export function TextField() {
  const { currentField, formData, updateFormData, nextField, prevField, isFirstField } = useFormContext();
  const [value, setValue] = useState(formData[currentField.id as keyof typeof formData] as string || '');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleContinue = () => {
    if (!value.trim()) {
      setError('This field is required');
      return;
    }
    setError('');
    updateFormData({ [currentField.id]: value.trim() });
    nextField();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleContinue();
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight">
        {currentField.label}
      </h1>

      {/* Input */}
      <div className="space-y-2">
        <motion.input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={currentField.placeholder}
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full h-14 px-4 rounded-xl text-lg
            bg-white border-2 transition-all duration-200
            placeholder:text-gray-400
            focus:outline-none focus:ring-4 focus:ring-blue-500/20
            ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
          `}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm pl-1"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-2">
        <FunnelButton onClick={handleContinue} disabled={!value.trim()}>
          Continue
        </FunnelButton>

        {!isFirstField && (
          <FunnelButton variant="back" onClick={prevField}>
            Back
          </FunnelButton>
        )}
      </div>
    </div>
  );
}
