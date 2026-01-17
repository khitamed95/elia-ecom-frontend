'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Modern Flat Button Component
 * @param {string} variant - 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = 'font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-200 hover:scale-105 active:scale-100',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-200 hover:scale-105 active:scale-100',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-200 hover:scale-105 active:scale-100',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:shadow-amber-200 hover:scale-105 active:scale-100',
    secondary: 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg hover:shadow-xl hover:shadow-gray-200 hover:scale-105 active:scale-100',
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:scale-105 active:scale-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-7 py-4 text-lg',
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'cursor-pointer';

  const finalClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabledClasses}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={finalClasses}
      {...props}
    >
      {loading && <Loader2 size={20} className="animate-spin" />}
      {children}
    </button>
  );
}
