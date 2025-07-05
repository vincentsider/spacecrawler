'use client'

import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/app/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    icon: Icon,
    iconPosition = 'right',
    loading = false,
    fullWidth = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
      ghost: 'text-foreground hover:bg-muted',
      gradient: 'bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary/30',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-5 text-base',
      lg: 'h-12 px-6 text-lg',
      xl: 'h-14 px-8 text-xl',
    }

    const iconSizes = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <motion.svg
            className={cn('animate-spin', iconSizes[size])}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
        )}

        {/* Icon Left */}
        {Icon && iconPosition === 'left' && !loading && (
          <Icon className={iconSizes[size]} />
        )}

        {/* Button Text */}
        <span>{children}</span>

        {/* Icon Right */}
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className={iconSizes[size]} />
        )}

        {/* Hover Effects */}
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-white"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.1 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {variant === 'gradient' && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }