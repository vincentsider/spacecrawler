import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JobsPage from '@/app/jobs/page'
import { createMockJobs } from '../../utils/factories'
import { supabase } from '@/app/lib/supabase'

// Mock Supabase
jest.mock('@/app/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  },
}))

describe('JobsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    (supabase.order as jest.Mock).mockResolvedValueOnce({ data: null })
    
    render(<JobsPage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render jobs after loading', async () => {
    const mockJobs = createMockJobs(3, { status: 'published' })
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Voice AI Engineer 1')).toBeInTheDocument()
      expect(screen.getByText('Voice AI Engineer 2')).toBeInTheDocument()
      expect(screen.getByText('Voice AI Engineer 3')).toBeInTheDocument()
    })
  })

  it('should filter jobs by search query', async () => {
    const user = userEvent.setup()
    const mockJobs = [
      createMockJobs(1, { title: 'Senior Voice AI Engineer' })[0],
      createMockJobs(1, { title: 'Junior Developer' })[0],
      createMockJobs(1, { title: 'Voice ML Researcher' })[0],
    ]
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Senior Voice AI Engineer')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search jobs...')
    await user.type(searchInput, 'voice')
    
    await waitFor(() => {
      expect(screen.getByText('Senior Voice AI Engineer')).toBeInTheDocument()
      expect(screen.getByText('Voice ML Researcher')).toBeInTheDocument()
      expect(screen.queryByText('Junior Developer')).not.toBeInTheDocument()
    })
  })

  it('should filter jobs by location type', async () => {
    const user = userEvent.setup()
    const mockJobs = [
      createMockJobs(1, { location_type: 'remote' })[0],
      createMockJobs(1, { location_type: 'onsite' })[0],
      createMockJobs(1, { location_type: 'hybrid' })[0],
    ]
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(3)
    })
    
    const locationSelect = screen.getByRole('combobox', { name: /location type/i })
    await user.selectOptions(locationSelect, 'remote')
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(1)
      expect(screen.getByText('Remote')).toBeInTheDocument()
    })
  })

  it('should filter jobs by company', async () => {
    const user = userEvent.setup()
    const mockJobs = [
      createMockJobs(1, { company_name: 'VoiceTech Inc' })[0],
      createMockJobs(1, { company_name: 'AI Labs' })[0],
      createMockJobs(1, { company_name: 'VoiceTech Inc' })[0],
    ]
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(3)
    })
    
    const companySelect = screen.getByRole('combobox', { name: /company/i })
    await user.selectOptions(companySelect, 'VoiceTech Inc')
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(2)
      expect(screen.getAllByText('VoiceTech Inc')).toHaveLength(2)
    })
  })

  it('should clear all filters', async () => {
    const user = userEvent.setup()
    const mockJobs = createMockJobs(5, { status: 'published' })
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(5)
    })
    
    // Apply filters
    const searchInput = screen.getByPlaceholderText('Search jobs...')
    await user.type(searchInput, 'specific')
    
    await waitFor(() => {
      expect(screen.queryByText(/Voice AI Engineer/)).not.toBeInTheDocument()
    })
    
    // Clear filters
    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    await user.click(clearButton)
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(5)
      expect(searchInput).toHaveValue('')
    })
  })

  it('should show empty state when no jobs match filters', async () => {
    const mockJobs = createMockJobs(2, { status: 'published' })
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(2)
    })
    
    const searchInput = screen.getByPlaceholderText('Search jobs...')
    await userEvent.type(searchInput, 'nonexistent')
    
    await waitFor(() => {
      expect(screen.getByText('No jobs found matching your criteria.')).toBeInTheDocument()
    })
  })

  it('should display job count correctly', async () => {
    const mockJobs = createMockJobs(10, { status: 'published' })
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Showing 10 of 10 jobs')).toBeInTheDocument()
    })
  })

  it('should handle database errors gracefully', async () => {
    ;(supabase.order as jest.Mock).mockRejectedValueOnce(new Error('Database error'))
    
    render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load jobs. Please try again later.')).toBeInTheDocument()
    })
  })

  it('should maintain filter state across re-renders', async () => {
    const user = userEvent.setup()
    const mockJobs = createMockJobs(3, { status: 'published' })
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    const { rerender } = render(<JobsPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText(/Voice AI Engineer/)).toHaveLength(3)
    })
    
    const searchInput = screen.getByPlaceholderText('Search jobs...')
    await user.type(searchInput, 'test')
    
    rerender(<JobsPage />)
    
    expect(searchInput).toHaveValue('test')
  })

  it('should display correct metadata in page header', async () => {
    const mockJobs = createMockJobs(1, { status: 'published' })
    ;(supabase.order as jest.Mock).mockResolvedValueOnce({ data: mockJobs })
    
    render(<JobsPage />)
    
    expect(screen.getByText('Voice AI Jobs')).toBeInTheDocument()
    expect(screen.getByText('Find your next opportunity in voice technology')).toBeInTheDocument()
  })
})