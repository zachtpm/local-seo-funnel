'use client';

import { useFormContext } from './FormContext';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, label: 'Your Info' },
  { number: 2, label: 'Business' },
  { number: 3, label: 'Contact' },
];

export function StepIndicator() {
  const { currentStep } = useFormContext();
  const progressValue = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-10">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <Progress value={progressValue} className="h-1.5 bg-muted/50" />
        <div className="absolute inset-0 flex justify-between items-center">
          {steps.map((step) => (
            <div
              key={step.number}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 -mt-4',
                currentStep > step.number
                  ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/30'
                  : currentStep === step.number
                  ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-110'
                  : 'bg-white border-2 border-muted text-muted-foreground shadow-sm'
              )}
            >
              {currentStep > step.number ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Labels */}
      <div className="flex justify-between px-0">
        {steps.map((step) => (
          <div
            key={step.number}
            className={cn(
              'text-xs font-semibold transition-colors text-center w-16',
              currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}
