'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { variant?: 'default' | 'ymyl-warning' }
>(({ className, sideOffset = 4, variant = 'default', children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-lg border px-3 py-1.5 text-xs shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        variant === 'default' && 'border-[#0A0A0A] bg-[#0A0A0A] text-white',
        variant === 'ymyl-warning' && 'border-[#F59E0B] bg-[#FEF3C7] text-[#92400E]',
        className
      )}
      {...props}
    >
      {variant === 'ymyl-warning' && (
        <span className="inline-flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {children}
        </span>
      )}
      {variant === 'default' && children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
