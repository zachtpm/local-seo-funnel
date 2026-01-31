'use client';

import { FormProvider } from '@/components/FormContext';
import { FunnelForm } from '@/components/FunnelForm';

export default function Home() {
  return (
    <FormProvider>
      <FunnelForm />
    </FormProvider>
  );
}
