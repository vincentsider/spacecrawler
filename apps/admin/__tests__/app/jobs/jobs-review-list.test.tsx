import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobsReviewList } from '@/app/(dashboard)/jobs/jobs-review-list'
import { createMockJobs } from '../../utils/factories'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}))

describe('JobsReviewList', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }

  beforeEach(() => {
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    mockSupabase.order.mockResolvedValueOnce({ data: null, error: null })
    
    render(<JobsReviewList />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render jobs after loading', async () => {
    const mockJobs = createMockJobs(3)
    mockSupabase.order.mockResolvedValueOnce({ data: mockJobs, error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
      expect(screen.getByText('Voice AI Engineer 2')).toBeInTheDocument()
      expect(screen.getByText('Voice AI Engineer 3')).toBeInTheDocument()
    })
  })

  it('should show empty state when no jobs', async () => {
    mockSupabase.order.mockResolvedValueOnce({ data: [], error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('No pending jobs to review')).toBeInTheDocument()
    })
  })

  it('should handle approval correctly', async () => {
    const mockJobs = createMockJobs(1)
    mockSupabase.order.mockResolvedValueOnce({ data: mockJobs, error: null })
    mockSupabase.eq.mockResolvedValueOnce({ data: null, error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
    })
    
    const approveButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(approveButton)
    
    await waitFor(() => {
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'published',
        published_at: expect.any(String),
      })
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'job-1')
    })
  })

  it('should handle rejection correctly', async () => {
    const mockJobs = createMockJobs(1)
    mockSupabase.order.mockResolvedValueOnce({ data: mockJobs, error: null })
    mockSupabase.eq.mockResolvedValueOnce({ data: null, error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
    })
    
    const rejectButton = screen.getByRole('button', { name: /reject/i })
    fireEvent.click(rejectButton)
    
    await waitFor(() => {
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'rejected',
      })
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'job-1')
    })
  })

  it('should show success toast on approval', async () => {
    const mockJobs = createMockJobs(1)
    mockSupabase.order.mockResolvedValueOnce({ data: mockJobs, error: null })
    mockSupabase.eq.mockResolvedValueOnce({ data: null, error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
    })
    
    const approveButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(approveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Job approved and sent to Space')).toBeInTheDocument()
    })
  })

  it('should show success toast on rejection', async () => {
    const mockJobs = createMockJobs(1)
    mockSupabase.order.mockResolvedValueOnce({ data: mockJobs, error: null })
    mockSupabase.eq.mockResolvedValueOnce({ data: null, error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
    })
    
    const rejectButton = screen.getByRole('button', { name: /reject/i })
    fireEvent.click(rejectButton)
    
    await waitFor(() => {
      expect(screen.getByText('Job rejected')).toBeInTheDocument()
    })
  })

  it('should handle errors gracefully', async () => {
    const mockJobs = createMockJobs(1)
    mockSupabase.order.mockResolvedValueOnce({ data: mockJobs, error: null })
    mockSupabase.eq.mockResolvedValueOnce({ 
      data: null, 
      error: new Error('Database error') 
    })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
    })
    
    const approveButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(approveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to update job')).toBeInTheDocument()
    })
  })

  it('should handle edit functionality', async () => {
    const mockJobs = createMockJobs(1)
    mockSupabase.order.mockResolvedValueOnce({ data: mockJobs, error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
    })
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    
    // Edit modal should open
    await waitFor(() => {
      expect(screen.getByText('Edit Job')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Voice AI Engineer 1')).toBeInTheDocument()
    })
  })

  it('should refresh data after action', async () => {
    const mockJobs = createMockJobs(2)
    const updatedJobs = createMockJobs(1, { id: 'job-2' })
    
    mockSupabase.order
      .mockResolvedValueOnce({ data: mockJobs, error: null })
      .mockResolvedValueOnce({ data: updatedJobs, error: null })
    mockSupabase.eq.mockResolvedValueOnce({ data: null, error: null })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
      expect(screen.getByText('Voice AI Engineer 2')).toBeInTheDocument()
    })
    
    const firstApproveButton = screen.getAllByRole('button', { name: /approve/i })[0]
    fireEvent.click(firstApproveButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Voice AI Engineer 1')).not.toBeInTheDocument()
      expect(screen.getByText('Voice AI Engineer 2')).toBeInTheDocument()
    })
  })

  it('should handle database fetch errors', async () => {
    mockSupabase.order.mockResolvedValueOnce({ 
      data: null, 
      error: new Error('Failed to fetch') 
    })
    
    render(<JobsReviewList />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load jobs')).toBeInTheDocument()
    })
  })
})