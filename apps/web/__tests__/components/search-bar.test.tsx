import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/app/components/search-bar'

describe('SearchBar', () => {
  const mockOnSearch = jest.fn()

  const defaultProps = {
    placeholder: 'Search...',
    onSearch: mockOnSearch,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with placeholder', () => {
    render(<SearchBar {...defaultProps} />)

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toBeInTheDocument()
  })

  it('should call onSearch when typing with debounce', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ delay: null })
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'voice ai')
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Fast forward debounce timer
    jest.advanceTimersByTime(300)
    
    expect(mockOnSearch).toHaveBeenCalledWith('voice ai')
    expect(mockOnSearch).toHaveBeenCalledTimes(1)
    
    jest.useRealTimers()
  })

  it('should debounce multiple rapid inputs', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ delay: null })
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    // Type rapidly
    await user.type(input, 'v')
    jest.advanceTimersByTime(100)
    await user.type(input, 'o')
    jest.advanceTimersByTime(100)
    await user.type(input, 'i')
    jest.advanceTimersByTime(100)
    
    // Should not have called yet
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Complete the debounce
    jest.advanceTimersByTime(200)
    
    // Should only call once with final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1)
    expect(mockOnSearch).toHaveBeenCalledWith('voi')
    
    jest.useRealTimers()
  })

  it('should call onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup()
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'voice ai{Enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('voice ai')
  })

  it('should display search icon', () => {
    render(<SearchBar {...defaultProps} />)

    const searchIcon = screen.getByTestId('search-icon')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test query')
    
    // Clear button should appear
    const clearButton = screen.getByRole('button', { name: /clear/i })
    expect(clearButton).toBeInTheDocument()
    
    await user.click(clearButton)
    
    expect(input).toHaveValue('')
    expect(mockOnSearch).toHaveBeenLastCalledWith('')
  })

  it('should not show clear button when input is empty', () => {
    render(<SearchBar {...defaultProps} />)

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('should maintain focus after clearing', async () => {
    const user = userEvent.setup()
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test')
    
    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)
    
    expect(input).toHaveFocus()
  })

  it('should handle initial value prop', () => {
    render(<SearchBar {...defaultProps} initialValue="initial search" />)

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toHaveValue('initial search')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<SearchBar {...defaultProps} disabled />)

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<SearchBar {...defaultProps} className="custom-class" />)

    const container = screen.getByTestId('search-container')
    expect(container).toHaveClass('custom-class')
  })

  it('should handle paste events', async () => {
    jest.useFakeTimers()
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    // Simulate paste
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => 'pasted text',
      },
    })
    
    // Update input value manually (paste event doesn't do this automatically in tests)
    fireEvent.change(input, { target: { value: 'pasted text' } })
    
    jest.advanceTimersByTime(300)
    
    expect(mockOnSearch).toHaveBeenCalledWith('pasted text')
    
    jest.useRealTimers()
  })

  it('should have proper accessibility attributes', () => {
    render(<SearchBar {...defaultProps} />)

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveAttribute('role', 'searchbox')
    expect(input).toHaveAttribute('aria-label', 'Search')
  })

  it('should handle very long search queries', async () => {
    const user = userEvent.setup()
    const longQuery = 'a'.repeat(1000)
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, longQuery)
    
    expect(input).toHaveValue(longQuery)
  })

  it('should trim whitespace from search query', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ delay: null })
    
    render(<SearchBar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, '  voice ai  ')
    
    jest.advanceTimersByTime(300)
    
    expect(mockOnSearch).toHaveBeenCalledWith('voice ai')
    
    jest.useRealTimers()
  })
})