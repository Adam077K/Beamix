import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // self-start keeps the button sized to its content even inside a flex/grid
  // parent (align-items:stretch would otherwise full-bleed it — the agency
  // "Generate audit" slab + tool-page CTA slab bug). Full-width is opt-in:
  // pass `w-full self-stretch` explicitly.
  // Disabled is a NEUTRAL bordered-ghost, never a washed/translucent accent
  // (the settings disabled-Save "looks half-loaded/broken" bug).
  'inline-flex self-start items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-[#3370FF] text-white hover:bg-[#1f5ce8] active:bg-[#1a52d6] disabled:border disabled:border-[#E5E7EB] disabled:bg-transparent disabled:text-[#9CA3AF]',
        secondary:
          'bg-[#0A0A0A] text-white hover:bg-[#222222] active:bg-[#333333] disabled:border disabled:border-[#E5E7EB] disabled:bg-transparent disabled:text-[#9CA3AF]',
        outline:
          'border border-[#E5E7EB] bg-white text-[#0A0A0A] hover:bg-[#F7F7F7] hover:border-[#D1D5DB] disabled:bg-transparent disabled:text-[#9CA3AF]',
        ghost:
          'text-[#0A0A0A] hover:bg-[#F3F4F6] disabled:text-[#9CA3AF]',
        destructive:
          'bg-[#EF4444] text-white hover:bg-[#DC2626] disabled:border disabled:border-[#E5E7EB] disabled:bg-transparent disabled:text-[#9CA3AF]',
        link:
          'text-[#3370FF] underline-offset-4 hover:underline p-0 h-auto disabled:text-[#9CA3AF] disabled:no-underline',
        'tier-locked':
          'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed border border-[#E5E7EB]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {variant === 'tier-locked' && <Lock className="h-3.5 w-3.5 shrink-0" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
