'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/app/lib/utils'

interface NewsletterProps {
  variant?: 'default' | 'inline' | 'hero'
  className?: string
}

export function Newsletter({ variant = 'default', className }: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock success - replace with actual API call
    setStatus('success')
    setMessage('Thanks for subscribing! Check your inbox to confirm.')
    setEmail('')
    
    // Reset after 5 seconds
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  const variants = {
    default: {
      container: 'rounded-2xl bg-gradient-primary p-8 text-white shadow-xl',
      title: 'text-3xl font-serif font-bold mb-2',
      description: 'text-lg opacity-90 mb-6',
      form: 'flex flex-col sm:flex-row gap-3',
      input: 'bg-white/20 border-white/30 text-white placeholder-white/60 backdrop-blur',
    },
    inline: {
      container: 'rounded-xl bg-card p-6 shadow-lg',
      title: 'text-2xl font-serif font-bold mb-2 text-foreground',
      description: 'text-muted-foreground mb-4',
      form: 'flex flex-col sm:flex-row gap-3',
      input: 'bg-background border-border',
    },
    hero: {
      container: 'text-center',
      title: 'text-4xl font-serif font-bold mb-3 text-foreground',
      description: 'text-xl text-muted-foreground mb-8',
      form: 'flex flex-col sm:flex-row gap-4 max-w-md mx-auto',
      input: 'bg-card border-border text-lg h-14',
    }
  }

  const currentVariant = variants[variant]

  return (
    <motion.div
      className={cn(currentVariant.container, className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Icon for default variant */}
      {variant === 'default' && (
        <motion.div
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Mail className="h-6 w-6" />
        </motion.div>
      )}

      {/* Title */}
      <h3 className={currentVariant.title}>
        {variant === 'hero' ? 'Join 10,000+ Voice AI Professionals' : 'Stay in the Loop'}
      </h3>

      {/* Description */}
      <p className={currentVariant.description}>
        {variant === 'hero' 
          ? 'Get weekly insights on the latest voice AI jobs, events, and breakthrough products.'
          : 'Get the latest voice AI opportunities delivered to your inbox.'}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className={currentVariant.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={status === 'loading' || status === 'success'}
          className={cn(
            'flex-1 rounded-xl px-4 py-3 font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
            'disabled:opacity-50',
            currentVariant.input
          )}
        />
        
        <Button
          type="submit"
          variant={variant === 'default' ? 'secondary' : 'primary'}
          size={variant === 'hero' ? 'lg' : 'md'}
          loading={status === 'loading'}
          disabled={status === 'success'}
          className={variant === 'default' ? 'shadow-lg' : ''}
        >
          {status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </Button>
      </form>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-4 flex items-center gap-2 text-sm',
            status === 'success' && (variant === 'default' ? 'text-white' : 'text-success'),
            status === 'error' && (variant === 'default' ? 'text-white' : 'text-error')
          )}
        >
          {status === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message}</span>
        </motion.div>
      )}

      {/* Privacy Note */}
      {variant !== 'inline' && (
        <p className={cn(
          'mt-4 text-xs',
          variant === 'default' ? 'text-white/60' : 'text-muted-foreground'
        )}>
          We respect your privacy. Unsubscribe at any time.
        </p>
      )}
    </motion.div>
  )
}