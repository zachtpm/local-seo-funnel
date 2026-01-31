'use client';

import { useFormContext } from '../FormContext';
import { TextField } from './TextField';
import { CityField } from './CityField';
import { BusinessField } from './BusinessField';
import { EmailField } from './EmailField';
import { PhoneField } from './PhoneField';
import { CalendlyField } from './CalendlyField';

export function FieldRenderer() {
  const { currentField } = useFormContext();

  switch (currentField.type) {
    case 'text':
      return <TextField />;
    case 'city':
      return <CityField />;
    case 'business':
      return <BusinessField />;
    case 'email':
      return <EmailField />;
    case 'phone':
      return <PhoneField />;
    case 'calendly':
      return <CalendlyField />;
    default:
      return <TextField />;
  }
}
