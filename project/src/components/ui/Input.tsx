import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-neutral-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full px-4 py-2.5 border border-neutral-300 rounded-xl shadow-soft placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200',
          {
            'border-danger-300 focus:border-danger-500 focus:ring-danger-500': error,
          },
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-600 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-neutral-500">{hint}</p>
      )}
    </div>
  );
}