'use client';

import { useState } from 'react';
import { useFormContext } from '../FormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function Step3Contact() {
  const { formData, updateFormData, prevStep } = useFormContext();
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateFormData({ email: value });
    if (emailTouched) {
      if (!value) setEmailError('Email is required');
      else if (!validateEmail(value)) setEmailError('Please enter a valid email address');
      else setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!formData.email) setEmailError('Email is required');
    else if (!validateEmail(formData.email)) setEmailError('Please enter a valid email address');
    else setEmailError('');
  };

  const handleSubmit = () => {
    setEmailTouched(true);
    if (!formData.email) { setEmailError('Email is required'); return; }
    if (!validateEmail(formData.email)) { setEmailError('Please enter a valid email address'); return; }

    setIsSubmitting(true);
    console.log('Form Submission:', { ...formData, submittedAt: new Date().toISOString() });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">Thank you, {formData.firstName}!</h2>
        <p className="text-muted-foreground text-base">
          We'll contact you about <span className="font-semibold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">{formData.businessName}</span> soon.
        </p>

        <Card className="mt-8 bg-gradient-to-br from-muted/30 via-white to-muted/20 border-muted/50 text-left shadow-md">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Submission Summary
            </h3>
            <div className="space-y-2.5 text-sm">
              <p className="text-foreground">
                <span className="text-muted-foreground inline-block w-20">Name:</span>
                <span className="font-medium">{formData.firstName} {formData.lastName}</span>
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground inline-block w-20">Business:</span>
                <span className="font-medium">{formData.businessName}</span>
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground inline-block w-20">Location:</span>
                <span className="font-medium">{formData.city}</span>
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground inline-block w-20">Email:</span>
                <span className="font-medium">{formData.email}</span>
              </p>
              {formData.userPhone && (
                <p className="text-foreground">
                  <span className="text-muted-foreground inline-block w-20">Phone:</span>
                  <span className="font-medium">{formData.userPhone}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-muted-foreground/70 text-sm mt-6 font-medium">Check your email for confirmation details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>
        <p className="text-sm text-muted-foreground mt-1">How can we reach you?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          placeholder="you@example.com"
          className={cn('h-11', emailError && emailTouched && 'border-destructive focus-visible:ring-destructive/20')}
          aria-invalid={!!(emailError && emailTouched)}
        />
        {emailError && emailTouched && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userPhone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="userPhone"
          type="tel"
          value={formData.userPhone}
          onChange={(e) => updateFormData({ userPhone: formatPhoneNumber(e.target.value) })}
          placeholder="(555) 123-4567"
          className="h-11"
        />
      </div>

      {calendlyUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 text-center">Schedule Your Free Consultation</h3>
          <Card className="overflow-hidden border">
            <iframe
              src={calendlyUrl}
              width="100%"
              height="600"
              frameBorder="0"
              title="Schedule a consultation"
              className="w-full min-h-[500px] sm:min-h-[600px]"
            />
          </Card>
        </div>
      )}

      <div className="pt-4 space-y-3">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Request'
          )}
        </Button>

        <Button variant="ghost" onClick={prevStep} disabled={isSubmitting} className="w-full text-muted-foreground">
          ← Back to business details
        </Button>
      </div>
    </div>
  );
}

export function validateStep3(formData: { email: string }): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return formData.email.trim() !== '' && emailRegex.test(formData.email);
}
