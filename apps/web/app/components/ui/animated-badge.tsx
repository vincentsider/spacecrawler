'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/app/lib/utils'

interface AnimatedBadgeProps {
  children: ReactNode
  className?: string
}

export function AnimatedBadge({ children, className }: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2',
        className
      )}
    >
      {children}
    </motion.div>
  )
}