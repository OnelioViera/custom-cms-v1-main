'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ValidatedInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export default function ValidatedInput({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = 'text',
  placeholder,
  disabled,
  onBlur,
}: ValidatedInputProps) {
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
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            setTouched(true);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${
            showError
              ? 'border-red-500 focus-visible:ring-red-500'
              : showSuccess
              ? 'border-green-500 focus-visible:ring-green-500'
              : ''
          }`}
        />
        {showSuccess && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
        {showError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
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
