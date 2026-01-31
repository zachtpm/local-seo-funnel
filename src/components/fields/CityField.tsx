'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../FormContext';
import { FunnelButton } from './FunnelButton';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    google: typeof google;
  }
}

export function CityField() {
  const { currentField, formData, updateFormData, nextField, prevField } = useFormContext();
  const [value, setValue] = useState(formData.city || '');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || autocompleteRef.current) return;
      if (!window.google?.maps?.places) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          setValue(place.formatted_address);
          setError('');
        } else if (place?.name) {
          setValue(place.name);
          setError('');
        }
      });
    };

    if (window.google?.maps?.places) {
      initAutocomplete();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogle);
          initAutocomplete();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleContinue = () => {
    if (!value.trim()) {
      setError('Please enter your city');
      return;
    }
    setError('');
    updateFormData({ city: value.trim() });
    nextField();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      // Don't submit if autocomplete is open
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && getComputedStyle(pacContainer).display !== 'none') {
        return;
      }
      handleContinue();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight">
        {currentField.label}
      </h1>

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

      <div className="space-y-3 pt-2">
        <FunnelButton onClick={handleContinue} disabled={!value.trim()}>
          Continue
        </FunnelButton>
        <FunnelButton variant="back" onClick={prevField}>
          Back
        </FunnelButton>
      </div>
    </div>
  );
}
