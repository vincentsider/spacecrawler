import { render, screen } from '@testing-library/react'
import { JobCard } from '@/app/components/job-card'
import { createMockJob } from '../utils/factories'

describe('JobCard (Public)', () => {
  const defaultProps = {
    job: createMockJob({
      title: 'Senior Voice AI Engineer',
      company_name: 'VoiceTech Inc',
      location: 'San Francisco, CA',
      location_type: 'remote',
      description: 'Join our team building cutting-edge voice AI solutions...',
      salary_range: '$150,000 - $200,000',
      published_at: '2024-01-15T00:00:00Z',
    }),
  }

  it('should render job details correctly', () => {
    render(<JobCard {...defaultProps} />)

    expect(screen.getByText('Senior Voice AI Engineer')).toBeInTheDocument()
    expect(screen.getByText('VoiceTech Inc')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText('$150,000 - $200,000')).toBeInTheDocument()
  })

  it('should display remote badge', () => {
    render(<JobCard {...defaultProps} />)

    const remoteBadge = screen.getByText('Remote')
    expect(remoteBadge).toBeInTheDocument()
    expect(remoteBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('should display hybrid badge correctly', () => {
    const hybridJob = createMockJob({ location_type: 'hybrid' })
    render(<JobCard job={hybridJob} />)

    const hybridBadge = screen.getByText('Hybrid')
    expect(hybridBadge).toBeInTheDocument()
    expect(hybridBadge).toHaveClass('bg-purple-100', 'text-purple-800')
  })

  it('should display onsite badge correctly', () => {
    const onsiteJob = createMockJob({ location_type: 'onsite' })
    render(<JobCard job={onsiteJob} />)

    const onsiteBadge = screen.getByText('On-site')
    expect(onsiteBadge).toBeInTheDocument()
    expect(onsiteBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('should display published date correctly', () => {
    render(<JobCard {...defaultProps} />)

    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
  })

  it('should link to application URL', () => {
    render(<JobCard {...defaultProps} />)

    const applyButton = screen.getByRole('link', { name: /apply now/i })
    expect(applyButton).toHaveAttribute('href', 'https://example.com/jobs/123')
    expect(applyButton).toHaveAttribute('target', '_blank')
    expect(applyButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should truncate long descriptions', () => {
    const longDescription = 'Lorem ipsum '.repeat(100)
    const jobWithLongDesc = createMockJob({ description: longDescription })
    
    render(<JobCard job={jobWithLongDesc} />)
    
    const description = screen.getByText(/Lorem ipsum/)
    expect(description).toHaveClass('line-clamp-3')
  })

  it('should handle missing optional fields', () => {
    const minimalJob = createMockJob({
      salary_range: null,
      location: null,
      description: null,
    })
    
    render(<JobCard job={minimalJob} />)

    expect(screen.getByText('Senior Voice AI Engineer')).toBeInTheDocument()
    expect(screen.queryByText('$150,000 - $200,000')).not.toBeInTheDocument()
    expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument()
  })

  it('should have hover effects on card', () => {
    render(<JobCard {...defaultProps} />)

    const card = screen.getByText('Senior Voice AI Engineer').closest('div.group')
    expect(card).toHaveClass('hover:shadow-lg')
  })

  it('should have proper structure and styling', () => {
    render(<JobCard {...defaultProps} />)

    // Check for the card element
    const card = screen.getByText('Senior Voice AI Engineer').closest('div.group')
    expect(card).toHaveClass('relative', 'overflow-hidden', 'rounded-lg', 'border')
  })
})