import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobCard } from '@/components/job-card'
import { createMockJob } from '../utils/factories'

describe('JobCard', () => {
  const mockOnApprove = jest.fn()
  const mockOnReject = jest.fn()
  const mockOnEdit = jest.fn()

  const defaultProps = {
    job: createMockJob(),
    onApprove: mockOnApprove,
    onReject: mockOnReject,
    onEdit: mockOnEdit,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render job details correctly', () => {
    render(<JobCard {...defaultProps} />)

    expect(screen.getByText('Senior Voice AI Engineer')).toBeInTheDocument()
    expect(screen.getByText('VoiceTech Inc')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText('$150,000 - $200,000')).toBeInTheDocument()
    expect(screen.getByText(/Join our team building/)).toBeInTheDocument()
  })

  it('should display remote badge for remote jobs', () => {
    const remoteJob = createMockJob({ location_type: 'remote' })
    render(<JobCard {...defaultProps} job={remoteJob} />)

    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toHaveClass('badge')
  })

  it('should display hybrid badge for hybrid jobs', () => {
    const hybridJob = createMockJob({ location_type: 'hybrid' })
    render(<JobCard {...defaultProps} job={hybridJob} />)

    expect(screen.getByText('Hybrid')).toBeInTheDocument()
  })

  it('should display onsite badge for onsite jobs', () => {
    const onsiteJob = createMockJob({ location_type: 'onsite' })
    render(<JobCard {...defaultProps} job={onsiteJob} />)

    expect(screen.getByText('Onsite')).toBeInTheDocument()
  })

  it('should call onApprove when approve button is clicked', async () => {
    render(<JobCard {...defaultProps} />)
    
    const approveButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(mockOnApprove).toHaveBeenCalledWith('job-123')
    })
  })

  it('should call onReject when reject button is clicked', async () => {
    render(<JobCard {...defaultProps} />)
    
    const rejectButton = screen.getByRole('button', { name: /reject/i })
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(mockOnReject).toHaveBeenCalledWith('job-123')
    })
  })

  it('should call onEdit when edit button is clicked', () => {
    render(<JobCard {...defaultProps} />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(defaultProps.job)
  })

  it('should disable buttons while loading', async () => {
    mockOnApprove.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<JobCard {...defaultProps} />)
    
    const approveButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(approveButton)

    expect(approveButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()

    await waitFor(() => {
      expect(approveButton).not.toBeDisabled()
    })
  })

  it('should display publication date when available', () => {
    const jobWithDate = createMockJob({ 
      publication_date: '2024-01-15T00:00:00Z' 
    })
    render(<JobCard {...defaultProps} job={jobWithDate} />)

    expect(screen.getByText(/Posted Jan 15, 2024/)).toBeInTheDocument()
  })

  it('should display crawled date', () => {
    const jobWithCrawledDate = createMockJob({ 
      crawled_at: '2024-01-16T10:30:00Z' 
    })
    render(<JobCard {...defaultProps} job={jobWithCrawledDate} />)

    expect(screen.getByText(/Crawled Jan 16, 2024/)).toBeInTheDocument()
  })

  it('should handle missing optional fields gracefully', () => {
    const minimalJob = createMockJob({
      location: null,
      salary_range: null,
      publication_date: null,
      description: null,
    })
    
    render(<JobCard {...defaultProps} job={minimalJob} />)

    expect(screen.getByText('Senior Voice AI Engineer')).toBeInTheDocument()
    expect(screen.getByText('VoiceTech Inc')).toBeInTheDocument()
    expect(screen.queryByText('$150,000 - $200,000')).not.toBeInTheDocument()
  })

  it('should open application URL in new tab', () => {
    render(<JobCard {...defaultProps} />)
    
    const link = screen.getByRole('link', { name: /view original/i })
    
    expect(link).toHaveAttribute('href', 'https://example.com/jobs/123')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should truncate long descriptions', () => {
    const longDescription = 'Lorem ipsum '.repeat(50)
    const jobWithLongDesc = createMockJob({ description: longDescription })
    
    render(<JobCard {...defaultProps} job={jobWithLongDesc} />)
    
    const description = screen.getByText(/Lorem ipsum/)
    expect(description).toHaveClass('line-clamp-3')
  })
})