import { render, screen } from '@testing-library/react'
import { EventCard } from '@/app/components/event-card'
import { createMockEvent } from '../utils/factories'

describe('EventCard (Public)', () => {
  const defaultProps = {
    event: createMockEvent({
      title: 'Voice AI Summit 2024',
      organizer: 'AI Events Inc',
      start_date: '2024-06-15T09:00:00Z',
      end_date: '2024-06-15T17:00:00Z',
      location: 'San Francisco Convention Center',
      location_type: 'in-person',
      description: 'Join us for the premier voice AI conference...',
      price: '$299',
      image_url: 'https://example.com/images/event.jpg',
    }),
  }

  it('should render event details correctly', () => {
    render(<EventCard {...defaultProps} />)

    expect(screen.getByText('Voice AI Summit 2024')).toBeInTheDocument()
    expect(screen.getByText('AI Events Inc')).toBeInTheDocument()
    expect(screen.getByText('San Francisco Convention Center')).toBeInTheDocument()
    expect(screen.getByText('$299')).toBeInTheDocument()
  })

  it('should display event date correctly', () => {
    render(<EventCard {...defaultProps} />)

    expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument()
    expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument()
  })

  it('should display multi-day events correctly', () => {
    const multiDayEvent = createMockEvent({
      start_date: '2024-06-15T09:00:00Z',
      end_date: '2024-06-17T17:00:00Z',
    })
    render(<EventCard event={multiDayEvent} />)

    expect(screen.getByText('Jun 15 - Jun 17, 2024')).toBeInTheDocument()
  })

  it('should display online badge for online events', () => {
    const onlineEvent = createMockEvent({ location_type: 'online' })
    render(<EventCard event={onlineEvent} />)

    const onlineBadge = screen.getByText('Online')
    expect(onlineBadge).toBeInTheDocument()
    expect(onlineBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('should display hybrid badge for hybrid events', () => {
    const hybridEvent = createMockEvent({ location_type: 'hybrid' })
    render(<EventCard event={hybridEvent} />)

    const hybridBadge = screen.getByText('Hybrid')
    expect(hybridBadge).toBeInTheDocument()
    expect(hybridBadge).toHaveClass('bg-purple-100', 'text-purple-800')
  })

  it('should display event image when available', () => {
    render(<EventCard {...defaultProps} />)

    const image = screen.getByAltText('Voice AI Summit 2024')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/images/event.jpg')
  })

  it('should handle missing image gracefully', () => {
    const eventWithoutImage = createMockEvent({ image_url: null })
    render(<EventCard event={eventWithoutImage} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // Should show placeholder
    const placeholder = screen.getByTestId('image-placeholder')
    expect(placeholder).toBeInTheDocument()
  })

  it('should link to event URL', () => {
    render(<EventCard {...defaultProps} />)

    const registerButton = screen.getByRole('link', { name: /register/i })
    expect(registerButton).toHaveAttribute('href', 'https://example.com/events/voice-ai-summit')
    expect(registerButton).toHaveAttribute('target', '_blank')
    expect(registerButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should display free events with special styling', () => {
    const freeEvent = createMockEvent({ price: 'Free' })
    render(<EventCard event={freeEvent} />)

    const freeTag = screen.getByText('Free')
    expect(freeTag).toBeInTheDocument()
    expect(freeTag).toHaveClass('text-green-600', 'font-semibold')
  })

  it('should truncate long descriptions', () => {
    const longDescription = 'Lorem ipsum '.repeat(100)
    const eventWithLongDesc = createMockEvent({ description: longDescription })
    
    render(<EventCard event={eventWithLongDesc} />)
    
    const description = screen.getByText(/Lorem ipsum/)
    expect(description).toHaveClass('line-clamp-2')
  })

  it('should display calendar icon', () => {
    render(<EventCard {...defaultProps} />)

    const calendarIcon = screen.getByTestId('calendar-icon')
    expect(calendarIcon).toBeInTheDocument()
  })

  it('should display location icon for in-person events', () => {
    render(<EventCard {...defaultProps} />)

    const locationIcon = screen.getByTestId('map-pin-icon')
    expect(locationIcon).toBeInTheDocument()
  })

  it('should display organizer with users icon', () => {
    render(<EventCard {...defaultProps} />)

    const usersIcon = screen.getByTestId('users-icon')
    expect(usersIcon).toBeInTheDocument()
  })

  it('should handle events without end date', () => {
    const singleDayEvent = createMockEvent({ end_date: null })
    render(<EventCard event={singleDayEvent} />)

    expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument()
    expect(screen.queryByText('-')).not.toBeInTheDocument()
  })

  it('should have hover effects', () => {
    render(<EventCard {...defaultProps} />)

    const card = screen.getByRole('article')
    expect(card).toHaveClass('hover:shadow-xl')
  })
})