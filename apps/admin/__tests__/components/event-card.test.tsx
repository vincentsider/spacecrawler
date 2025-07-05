import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EventCard } from '@/components/event-card'
import { createMockEvent } from '../utils/factories'

describe('EventCard', () => {
  const mockOnApprove = jest.fn()
  const mockOnReject = jest.fn()
  const mockOnEdit = jest.fn()

  const defaultProps = {
    event: createMockEvent(),
    onApprove: mockOnApprove,
    onReject: mockOnReject,
    onEdit: mockOnEdit,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render event details correctly', () => {
    render(<EventCard {...defaultProps} />)

    expect(screen.getByText('Voice AI Summit 2024')).toBeInTheDocument()
    expect(screen.getByText('AI Events Inc')).toBeInTheDocument()
    expect(screen.getByText('San Francisco Convention Center')).toBeInTheDocument()
    expect(screen.getByText('$299')).toBeInTheDocument()
    expect(screen.getByText(/Join us for the premier voice AI conference/)).toBeInTheDocument()
  })

  it('should display event dates correctly', () => {
    render(<EventCard {...defaultProps} />)

    expect(screen.getByText(/Jun 15, 2024/)).toBeInTheDocument()
    expect(screen.getByText(/9:00 AM - 5:00 PM/)).toBeInTheDocument()
  })

  it('should display multi-day events correctly', () => {
    const multiDayEvent = createMockEvent({
      start_date: '2024-06-15T09:00:00Z',
      end_date: '2024-06-17T17:00:00Z',
    })
    render(<EventCard {...defaultProps} event={multiDayEvent} />)

    expect(screen.getByText(/Jun 15 - Jun 17, 2024/)).toBeInTheDocument()
  })

  it('should display location type badge', () => {
    const onlineEvent = createMockEvent({ location_type: 'online' })
    render(<EventCard {...defaultProps} event={onlineEvent} />)

    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.getByText('Online')).toHaveClass('badge')
  })

  it('should call onApprove when approve button is clicked', async () => {
    render(<EventCard {...defaultProps} />)
    
    const approveButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(mockOnApprove).toHaveBeenCalledWith('event-456')
    })
  })

  it('should call onReject when reject button is clicked', async () => {
    render(<EventCard {...defaultProps} />)
    
    const rejectButton = screen.getByRole('button', { name: /reject/i })
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(mockOnReject).toHaveBeenCalledWith('event-456')
    })
  })

  it('should call onEdit when edit button is clicked', () => {
    render(<EventCard {...defaultProps} />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(defaultProps.event)
  })

  it('should display event image when available', () => {
    render(<EventCard {...defaultProps} />)

    const image = screen.getByAltText('Voice AI Summit 2024')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/images/event.jpg')
  })

  it('should handle missing image gracefully', () => {
    const eventWithoutImage = createMockEvent({ image_url: null })
    render(<EventCard {...defaultProps} event={eventWithoutImage} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should disable buttons while loading', async () => {
    mockOnApprove.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<EventCard {...defaultProps} />)
    
    const approveButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(approveButton)

    expect(approveButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()

    await waitFor(() => {
      expect(approveButton).not.toBeDisabled()
    })
  })

  it('should display free events correctly', () => {
    const freeEvent = createMockEvent({ price: 'Free' })
    render(<EventCard {...defaultProps} event={freeEvent} />)

    const freeTag = screen.getByText('Free')
    expect(freeTag).toBeInTheDocument()
    expect(freeTag).toHaveClass('text-green-600')
  })

  it('should open event URL in new tab', () => {
    render(<EventCard {...defaultProps} />)
    
    const link = screen.getByRole('link', { name: /view event/i })
    
    expect(link).toHaveAttribute('href', 'https://example.com/events/voice-ai-summit')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should handle online events without physical location', () => {
    const onlineEvent = createMockEvent({
      location: 'Online',
      location_type: 'online',
    })
    render(<EventCard {...defaultProps} event={onlineEvent} />)

    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.queryByText('San Francisco Convention Center')).not.toBeInTheDocument()
  })

  it('should display crawled date', () => {
    render(<EventCard {...defaultProps} />)

    expect(screen.getByText(/Crawled Jan 16, 2024/)).toBeInTheDocument()
  })
})