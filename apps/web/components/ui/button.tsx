import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all duration-150 shadow-xs cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-white hover:bg-brand-hover active:bg-brand-dark focus-visible:outline-brand',
        primary:
          'bg-brand text-white hover:bg-brand-hover active:bg-brand-dark focus-visible:outline-brand',
        secondary:
          'bg-card text-text-main border border-border-subtle hover:bg-bg-page hover:border-border-muted active:bg-border-subtle focus-visible:outline-brand',
        destructive:
          'text-red-600 hover:text-red-700 bg-red-50/80 border border-red-200/80 hover:bg-red-100/80 active:bg-red-100 focus-visible:outline-red-500',
        outline:
          'bg-card text-text-main border border-border-subtle hover:bg-bg-page hover:border-border-muted active:bg-border-subtle focus-visible:outline-brand',
        ghost: 'hover:bg-bg-page hover:text-text-main text-text-muted',
        link: 'text-brand-dark underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-5 py-2 text-sm',
        md: 'px-5 py-2 text-sm',
        sm: 'px-4 py-2 text-xs',
        xs: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-2.5 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
