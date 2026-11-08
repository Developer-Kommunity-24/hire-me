import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-all shadow-xs active:scale-95 cursor-pointer outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-action-dark hover:bg-black text-white shadow-xs',
        outline:
          'border border-border-subtle bg-white text-text-main hover:bg-slate-50 hover:border-slate-300 shadow-2xs',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/60',
        ghost: 'hover:bg-slate-100 hover:text-text-main text-text-muted shadow-none',
        destructive: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        link: 'text-action-dark underline-offset-4 hover:underline shadow-none active:scale-100',
      },
      size: {
        default: 'h-10 px-5 py-2.5 text-xs sm:text-sm gap-2',
        xs: "h-7 px-2.5 py-1 text-xs gap-1 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3.5 py-1.5 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 px-6 py-3 text-sm sm:text-base gap-2.5',
        icon: 'size-10',
        'icon-xs': "size-7 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-11',
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
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button'
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
