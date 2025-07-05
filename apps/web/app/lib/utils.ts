import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatEventDate(date: string | Date, time?: string) {
  const d = new Date(date)
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  
  if (time) {
    return `${dateStr} at ${time}`
  }
  
  return dateStr
}

export function isUpcoming(date: string | Date) {
  return new Date(date) >= new Date()
}