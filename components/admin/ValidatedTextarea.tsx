'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ValidatedTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export default function ValidatedTextarea({
  label,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  disabled,
  rows = 4,
}: ValidatedTextareaProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;
  const showSuccess = touched && !error && value && required;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={
            showError
              ? 'border-red-500 focus-visible:ring-red-500'
              : showSuccess
              ? 'border-green-500 focus-visible:ring-green-500'
              : ''
          }
        />
      </div>
      {showError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
