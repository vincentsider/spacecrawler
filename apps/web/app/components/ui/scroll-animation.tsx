'use client'

import { motion, useAnimation, useInView } from 'framer-motion'
import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  once?: boolean
}

export function ScrollAnimation({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  once = true,
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.3 })
  const controls = useAnimation()

  const directionOffset = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  }

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    } else if (!once) {
      controls.start('hidden')
    }
  }, [isInView, controls, once])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            delay,
            duration,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
        hidden: {
          opacity: 0,
          ...directionOffset[direction],
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger animation wrapper
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Parallax scroll effect
interface ParallaxProps {
  children: ReactNode
  className?: string
  offset?: number
}

export function Parallax({ children, className, offset = 50 }: ParallaxProps) {
  const ref = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = (ref.current as HTMLElement).getBoundingClientRect()
        const speed = offset / 100
        setScrollY(rect.top * speed)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [offset])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${scrollY}px)`,
      }}
    >
      {children}
    </motion.div>
  )
}