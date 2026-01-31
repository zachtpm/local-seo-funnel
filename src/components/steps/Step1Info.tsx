'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormContext } from '../FormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  city?: string;
}

export function Step1Info() {
  const { formData, updateFormData } = useFormContext();
  const cityInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const initAutocomplete = () => {
      try {
        if (!cityInputRef.current || autocompleteRef.current) return;
        if (!window.google?.maps?.places) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          cityInputRef.current,
          { types: ['(cities)'] }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            updateFormData({ city: place.formatted_address });
            setErrors((prev) => ({ ...prev, city: undefined }));
          } else if (place?.name) {
            updateFormData({ city: place.name });
            setErrors((prev) => ({ ...prev, city: undefined }));
          }
        });
      } catch (error) {
        console.error('Google Maps initialization error:', error);
        setApiError('Unable to load location services. You can still type your city manually.');
      }
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

      const timeout = setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google?.maps?.places) {
          setApiError('Location services unavailable. You can still type your city manually.');
        }
      }, 10000);

      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    }

    return () => {
      if (autocompleteRef.current) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [updateFormData]);

  const validateField = (field: keyof FieldErrors, value: string) => {
    if (!value.trim()) {
      return `${field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : 'City'} is required`;
    }
    return undefined;
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field];
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof FieldErrors, value: string) => {
    updateFormData({ [field]: value });
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Let's get started</h2>
        <p className="text-sm text-muted-foreground mt-1">Tell us a bit about yourself</p>
      </div>

      {apiError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="John"
            className={cn(
              'h-11',
              errors.firstName && touched.firstName && 'border-destructive focus-visible:ring-destructive/20'
            )}
            aria-invalid={!!(errors.firstName && touched.firstName)}
          />
          {errors.firstName && touched.firstName && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Smith"
            className={cn(
              'h-11',
              errors.lastName && touched.lastName && 'border-destructive focus-visible:ring-destructive/20'
            )}
            aria-invalid={!!(errors.lastName && touched.lastName)}
          />
          {errors.lastName && touched.lastName && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">
          City <span className="text-destructive">*</span>
        </Label>
        <Input
          ref={cityInputRef}
          id="city"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          onBlur={() => handleBlur('city')}
          placeholder="Start typing your city..."
          className={cn(
            'h-11',
            errors.city && touched.city && 'border-destructive focus-visible:ring-destructive/20'
          )}
          aria-invalid={!!(errors.city && touched.city)}
        />
        {errors.city && touched.city && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.city}
          </p>
        )}
      </div>
    </div>
  );
}

export function validateStep1(formData: { firstName: string; lastName: string; city: string }): boolean {
  return (
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.city.trim() !== ''
  );
}
