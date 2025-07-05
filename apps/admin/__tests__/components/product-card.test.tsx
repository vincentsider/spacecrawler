import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from '@/components/product-card'
import { createMockProduct } from '../utils/factories'

describe('ProductCard', () => {
  const mockOnApprove = jest.fn()
  const mockOnReject = jest.fn()
  const mockOnEdit = jest.fn()

  const defaultProps = {
    product: createMockProduct(),
    onApprove: mockOnApprove,
    onReject: mockOnReject,
    onEdit: mockOnEdit,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render product details correctly', () => {
    render(<ProductCard {...defaultProps} />)

    expect(screen.getByText('VoiceBot Pro')).toBeInTheDocument()
    expect(screen.getByText('AI Solutions Ltd')).toBeInTheDocument()
    expect(screen.getByText('Voice AI Platform')).toBeInTheDocument()
    expect(screen.getByText('Build voice apps with ease')).toBeInTheDocument()
    expect(screen.getByText(/Advanced voice AI platform/)).toBeInTheDocument()
  })

  it('should display product features', () => {
    render(<ProductCard {...defaultProps} />)

    expect(screen.getByText('Natural Language Processing')).toBeInTheDocument()
    expect(screen.getByText('Multi-language Support')).toBeInTheDocument()
    expect(screen.getByText('Real-time Analytics')).toBeInTheDocument()
  })

  it('should display use cases', () => {
    render(<ProductCard {...defaultProps} />)

    expect(screen.getByText('Customer Service')).toBeInTheDocument()
    expect(screen.getByText('Voice Assistants')).toBeInTheDocument()
    expect(screen.getByText('IVR Systems')).toBeInTheDocument()
  })

  it('should display pricing information', () => {
    render(<ProductCard {...defaultProps} />)

    expect(screen.getByText('Starting at $99/month')).toBeInTheDocument()
  })

  it('should call onApprove with Send to Space button', async () => {
    render(<ProductCard {...defaultProps} />)
    
    const approveButton = screen.getByRole('button', { name: /send to space/i })
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(mockOnApprove).toHaveBeenCalledWith('product-789')
    })
  })

  it('should call onReject when reject button is clicked', async () => {
    render(<ProductCard {...defaultProps} />)
    
    const rejectButton = screen.getByRole('button', { name: /reject/i })
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(mockOnReject).toHaveBeenCalledWith('product-789')
    })
  })

  it('should call onEdit when edit button is clicked', () => {
    render(<ProductCard {...defaultProps} />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(defaultProps.product)
  })

  it('should display product image when available', () => {
    render(<ProductCard {...defaultProps} />)

    const image = screen.getByAltText('VoiceBot Pro')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/images/product.png')
  })

  it('should handle missing image gracefully', () => {
    const productWithoutImage = createMockProduct({ image_url: null })
    render(<ProductCard {...defaultProps} product={productWithoutImage} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should disable buttons while loading', async () => {
    mockOnApprove.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<ProductCard {...defaultProps} />)
    
    const approveButton = screen.getByRole('button', { name: /send to space/i })
    fireEvent.click(approveButton)

    expect(approveButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()

    await waitFor(() => {
      expect(approveButton).not.toBeDisabled()
    })
  })

  it('should handle products without features', () => {
    const productWithoutFeatures = createMockProduct({ features: null })
    render(<ProductCard {...defaultProps} product={productWithoutFeatures} />)

    expect(screen.queryByText('Key Features')).not.toBeInTheDocument()
  })

  it('should handle products without use cases', () => {
    const productWithoutUseCases = createMockProduct({ use_cases: null })
    render(<ProductCard {...defaultProps} product={productWithoutUseCases} />)

    expect(screen.queryByText('Use Cases')).not.toBeInTheDocument()
  })

  it('should handle products without pricing', () => {
    const productWithoutPricing = createMockProduct({ pricing_info: null })
    render(<ProductCard {...defaultProps} product={productWithoutPricing} />)

    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('should open product URL in new tab', () => {
    render(<ProductCard {...defaultProps} />)
    
    const link = screen.getByRole('link', { name: /visit website/i })
    
    expect(link).toHaveAttribute('href', 'https://example.com/products/voicebot-pro')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should display category badge with correct styling', () => {
    render(<ProductCard {...defaultProps} />)

    const categoryBadge = screen.getByText('Voice AI Platform')
    expect(categoryBadge).toHaveClass('badge')
  })

  it('should truncate long descriptions', () => {
    const longDescription = 'Lorem ipsum '.repeat(100)
    const productWithLongDesc = createMockProduct({ description: longDescription })
    
    render(<ProductCard {...defaultProps} product={productWithLongDesc} />)
    
    const description = screen.getByText(/Lorem ipsum/)
    expect(description).toHaveClass('line-clamp-4')
  })

  it('should display crawled date', () => {
    render(<ProductCard {...defaultProps} />)

    expect(screen.getByText(/Crawled Jan 16, 2024/)).toBeInTheDocument()
  })

  it('should display features as badges', () => {
    render(<ProductCard {...defaultProps} />)

    const features = screen.getAllByRole('listitem').filter(item => 
      item.textContent?.includes('Natural Language Processing') ||
      item.textContent?.includes('Multi-language Support') ||
      item.textContent?.includes('Real-time Analytics')
    )

    expect(features).toHaveLength(3)
    features.forEach(feature => {
      expect(feature.querySelector('.badge')).toBeInTheDocument()
    })
  })
})