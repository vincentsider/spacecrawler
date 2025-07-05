'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Zap } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface TickerItem {
  id: string
  text: string
  type?: 'breaking' | 'trending'
  url?: string
}

interface TickerProps {
  items: TickerItem[]
  speed?: number
  className?: string
}

export function Ticker({ items, speed = 30, className }: TickerProps) {
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items]

  return (
    <div className={cn('relative overflow-hidden bg-gradient-primary py-2', className)}>
      <div className="absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-primary px-4">
        <Zap className="h-4 w-4 text-white" />
        <span className="ml-2 text-sm font-semibold text-white">Breaking</span>
      </div>

      <div className="relative flex">
        <motion.div
          className="flex whitespace-nowrap pl-32"
          animate={{
            x: `-${100 / duplicatedItems.length * items.length}%`,
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: speed,
              ease: "linear",
            },
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="inline-flex items-center px-8"
            >
              {item.type === 'trending' && (
                <TrendingUp className="mr-2 h-3 w-3 text-white/80" />
              )}
              {item.url ? (
                <a
                  href={item.url}
                  className="text-sm font-medium text-white hover:text-white/80 transition-colors"
                >
                  {item.text}
                </a>
              ) : (
                <span className="text-sm font-medium text-white">
                  {item.text}
                </span>
              )}
              <span className="mx-8 text-white/40">•</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradient fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-accent to-transparent" />
    </div>
  )
}