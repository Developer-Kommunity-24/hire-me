import { type ReactNode } from 'react'

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  error?: string
  description?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  error,
  description,
  required,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold uppercase tracking-wider text-text-subtle"
        >
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {description && !error && <p className="text-xs text-text-subtle/80">{description}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-rose-500 animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  )
}
