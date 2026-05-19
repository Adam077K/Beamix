import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#3370FF] text-white',
        secondary:
          'border-transparent bg-[#F3F4F6] text-[#374151]',
        outline:
          'border-[#E5E7EB] text-[#374151] bg-transparent',
        destructive:
          'border-transparent bg-[#FEE2E2] text-[#DC2626]',
        success:
          'border-transparent bg-[#D1FAE5] text-[#065F46]',
        warning:
          'border-transparent bg-[#FEF3C7] text-[#92400E]',
        // impact variants for GEO agents
        'impact-low':
          'border-transparent bg-[#F3F4F6] text-[#6B7280]',
        'impact-medium':
          'border-transparent bg-[#FEF3C7] text-[#92400E]',
        'impact-high':
          'border-transparent bg-[#D1FAE5] text-[#065F46]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
