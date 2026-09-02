import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'text-brand-dark bg-brand-light border border-brand-mint',
        emerald:
          'text-brand-dark bg-brand-light border border-brand-mint uppercase tracking-wide font-bold',
        secondary: 'bg-bg-page text-text-muted border border-border-subtle font-mono rounded',
        outline:
          'bg-brand-light text-brand-dark border border-brand-mint/50 font-mono rounded hover:-translate-y-0.5 hover:shadow-xs transition-all duration-150',
        destructive: 'bg-red-50 text-red-600 border border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
