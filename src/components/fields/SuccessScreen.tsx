'use client';

import { useFormContext } from '../FormContext';
import { motion } from 'framer-motion';

export function SuccessScreen() {
  const { formData } = useFormContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF4FF] via-white to-white flex flex-col">
      {/* Logo */}
      <div className="pt-8 pb-4 px-4">
        <img
          src="/logo.svg"
          alt="Touchpoint Media"
          className="h-8 sm:h-10 w-auto mx-auto"
        />
      </div>

      {/* Success content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-[440px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            {/* Thank you message */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3"
            >
              Thank you, {formData.firstName}!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-lg mb-8"
            >
              We'll be in touch about{' '}
              <span className="font-semibold text-gray-700">{formData.businessName}</span> soon.
            </motion.p>

            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-left"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Submission Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="text-gray-400 w-24">Name</span>
                  <span className="text-gray-900 font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-400 w-24">Business</span>
                  <span className="text-gray-900 font-medium">{formData.businessName}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-400 w-24">Location</span>
                  <span className="text-gray-900 font-medium">{formData.city}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-400 w-24">Email</span>
                  <span className="text-gray-900 font-medium">{formData.email}</span>
                </div>
                {formData.userPhone && (
                  <div className="flex">
                    <span className="text-gray-400 w-24">Phone</span>
                    <span className="text-gray-900 font-medium">{formData.userPhone}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-400 text-sm mt-6"
            >
              Check your email for confirmation details
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 pt-4">
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
