'use client';

import { useState } from 'react';
import { useFormContext } from './FormContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormNavigationProps {
  canProceed?: boolean;
}

export function FormNavigation({ canProceed = true }: FormNavigationProps) {
  const { currentStep, nextStep, prevStep } = useFormContext();
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (canProceed) {
      setShowError(false);
      nextStep();
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="mt-8">
      {showError && !canProceed && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Please fill in all required fields before continuing.
        </div>
      )}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}

        <Button
          type="button"
          onClick={handleNext}
          className={cn(
            'w-full sm:w-auto h-11 px-6 font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30',
            !canProceed && 'opacity-70'
          )}
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
