'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/app/lib/utils'

interface FeatureCardProps {
  variant?: 'hero' | 'large' | 'medium' | 'small'
  image?: string
  title: string
  description?: string
  category?: string
  categoryColor?: string
  author?: string
  authorImage?: string
  date?: string
  readTime?: string
  tags?: string[]
  href?: string
  children?: ReactNode
  className?: string
  priority?: boolean
  index?: number
}

export function FeatureCard({
  variant = 'medium',
  image,
  title,
  description,
  category,
  categoryColor = 'primary',
  author,
  authorImage,
  date,
  readTime,
  tags,
  href,
  children,
  className,
  priority = false,
  index = 0,
}: FeatureCardProps) {
  const cardVariants = {
    hero: 'col-span-12 lg:col-span-8',
    large: 'col-span-12 md:col-span-6 lg:col-span-6',
    medium: 'col-span-12 md:col-span-6 lg:col-span-4',
    small: 'col-span-12 md:col-span-4 lg:col-span-3',
  }

  const imageHeights = {
    hero: 'h-[400px] lg:h-[500px]',
    large: 'h-[300px] lg:h-[350px]',
    medium: 'h-[200px] lg:h-[250px]',
    small: 'h-[150px] lg:h-[180px]',
  }

  const categoryColors = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  }

  const CardWrapper = href ? motion.a : motion.div

  return (
    <CardWrapper
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        cardVariants[variant],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Image Section */}
      {image && (
        <div className={cn('relative overflow-hidden', imageHeights[variant])}>
          {/* Parallax Image */}
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Category Badge */}
          {category && (
            <div className="absolute left-4 top-4">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                  categoryColors[categoryColor as keyof typeof categoryColors]
                )}
              >
                {category}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 className={cn(
          'font-serif font-bold leading-tight text-foreground',
          variant === 'hero' ? 'text-3xl lg:text-4xl' : 
          variant === 'large' ? 'text-2xl lg:text-3xl' : 
          variant === 'medium' ? 'text-xl lg:text-2xl' : 
          'text-lg'
        )}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={cn(
            'mt-3 line-clamp-3 text-muted-foreground',
            variant === 'hero' || variant === 'large' ? 'text-base' : 'text-sm'
          )}>
            {description}
          </p>
        )}

        {/* Author and Meta Info */}
        {(author || date || readTime) && (
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            {author && (
              <div className="flex items-center gap-2">
                {authorImage && (
                  <img
                    src={authorImage}
                    alt={author}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                )}
                <span className="font-medium">{author}</span>
              </div>
            )}
            {date && <span>{date}</span>}
            {readTime && <span>{readTime}</span>}
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Custom Children */}
        {children}
      </div>

      {/* Hover Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0"
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
    </CardWrapper>
  )
}