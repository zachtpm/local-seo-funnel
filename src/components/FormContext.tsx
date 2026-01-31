'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { FormData } from '@/types';

// Define all the fields/screens in the funnel
export const FUNNEL_FIELDS = [
  { id: 'firstName', label: "What's your first name?", placeholder: 'First name', type: 'text' },
  { id: 'lastName', label: "And your last name?", placeholder: 'Last name', type: 'text' },
  { id: 'city', label: 'What city is your business in?', placeholder: 'Start typing your city...', type: 'city' },
  { id: 'business', label: 'Find your business', placeholder: 'Search for your business...', type: 'business' },
  { id: 'email', label: "What's your email?", placeholder: 'you@example.com', type: 'email' },
  { id: 'userPhone', label: 'Your phone number (optional)', placeholder: '(555) 123-4567', type: 'phone' },
  { id: 'calendly', label: 'Schedule your free consultation', placeholder: '', type: 'calendly' },
] as const;

export type FieldId = typeof FUNNEL_FIELDS[number]['id'];

interface FormContextType {
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextField: () => void;
  prevField: () => void;
  totalFields: number;
  isFirstField: boolean;
  isLastField: boolean;
  currentField: typeof FUNNEL_FIELDS[number];
  isSubmitted: boolean;
  setIsSubmitted: (value: boolean) => void;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  city: '',
  businessName: '',
  placeId: '',
  address: '',
  phone: '',
  website: '',
  rating: 0,
  reviewCount: 0,
  email: '',
  userPhone: '',
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextField = () => {
    if (currentFieldIndex < FUNNEL_FIELDS.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    }
  };

  const prevField = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    }
  };

  return (
    <FormContext.Provider
      value={{
        currentFieldIndex,
        setCurrentFieldIndex,
        formData,
        updateFormData,
        nextField,
        prevField,
        totalFields: FUNNEL_FIELDS.length,
        isFirstField: currentFieldIndex === 0,
        isLastField: currentFieldIndex === FUNNEL_FIELDS.length - 1,
        currentField: FUNNEL_FIELDS[currentFieldIndex],
        isSubmitted,
        setIsSubmitted,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
