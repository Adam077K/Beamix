import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Border raised E5E7EB → D1D5DB + a faint inner recede so the field
          // reads as a fillable well, not a disabled/locked hairline box
          // (login/signup "inputs look pre-filled-and-locked" bug). M1/M7.
          'flex h-9 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF]',
          'shadow-[inset_0_1px_2px_rgba(10,10,10,0.04)]',
          'transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'hover:border-[#9CA3AF]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-0 focus-visible:border-[#3370FF] focus-visible:shadow-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F3F4F6] disabled:shadow-none',
          'aria-[invalid=true]:border-[#EF4444] aria-[invalid=true]:ring-[#EF4444]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
