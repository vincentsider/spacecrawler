import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/app/components/product-card'
import { createMockProduct } from '../utils/factories'

describe('ProductCard (Public)', () => {
  const defaultProps = {
    product: createMockProduct({
      name: 'VoiceBot Pro',
      company_name: 'AI Solutions Ltd',
      short_description: 'Build voice apps with ease',
      category: 'Voice AI Platform',
      pricing_info: 'Starting at $99/month',
      image_url: 'https://example.com/images/product.png',
      features: ['Natural Language Processing', 'Multi-language Support', 'Real-time Analytics'],
    }),
  }

  it('should render product details correctly', () => {
    render(<ProductCard {...defaultProps} />)

    expect(screen.getByText('VoiceBot Pro')).toBeInTheDocument()
    expect(screen.getByText('AI Solutions Ltd')).toBeInTheDocument()
    expect(screen.getByText('Build voice apps with ease')).toBeInTheDocument()
    expect(screen.getByText('Voice AI Platform')).toBeInTheDocument()
    expect(screen.getByText('Starting at $99/month')).toBeInTheDocument()
  })

  it('should display product image when available', () => {
    render(<ProductCard {...defaultProps} />)

    const image = screen.getByAltText('VoiceBot Pro')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/images/product.png')
  })

  it('should handle missing image with placeholder', () => {
    const productWithoutImage = createMockProduct({ image_url: null })
    render(<ProductCard product={productWithoutImage} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    const placeholder = screen.getByTestId('product-placeholder')
    expect(placeholder).toBeInTheDocument()
  })

  it('should display features as tags', () => {
    render(<ProductCard {...defaultProps} />)

    expect(screen.getByText('Natural Language Processing')).toBeInTheDocument()
    expect(screen.getByText('Multi-language Support')).toBeInTheDocument()
    expect(screen.getByText('Real-time Analytics')).toBeInTheDocument()
    
    // Check they have tag styling
    const features = screen.getAllByTestId('feature-tag')
    expect(features).toHaveLength(3)
    features.forEach(tag => {
      expect(tag).toHaveClass('bg-gray-100', 'text-gray-700')
    })
  })

  it('should limit displayed features to 3', () => {
    const manyFeatures = [
      'Feature 1',
      'Feature 2', 
      'Feature 3',
      'Feature 4',
      'Feature 5',
    ]
    const productWithManyFeatures = createMockProduct({ features: manyFeatures })
    render(<ProductCard product={productWithManyFeatures} />)

    const displayedFeatures = screen.getAllByTestId('feature-tag')
    expect(displayedFeatures).toHaveLength(3)
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('should link to product details page', () => {
    render(<ProductCard {...defaultProps} />)

    const learnMoreLink = screen.getByRole('link', { name: /learn more/i })
    expect(learnMoreLink).toHaveAttribute('href', '/products/product-789')
  })

  it('should link to external product URL', () => {
    render(<ProductCard {...defaultProps} />)

    const visitWebsiteLink = screen.getByRole('link', { name: /visit website/i })
    expect(visitWebsiteLink).toHaveAttribute('href', 'https://example.com/products/voicebot-pro')
    expect(visitWebsiteLink).toHaveAttribute('target', '_blank')
    expect(visitWebsiteLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should display category badge with correct styling', () => {
    render(<ProductCard {...defaultProps} />)

    const categoryBadge = screen.getByText('Voice AI Platform')
    expect(categoryBadge).toHaveClass('bg-indigo-100', 'text-indigo-800')
  })

  it('should handle products without pricing', () => {
    const productWithoutPricing = createMockProduct({ pricing_info: null })
    render(<ProductCard product={productWithoutPricing} />)

    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
    expect(screen.getByText('Contact for pricing')).toBeInTheDocument()
  })

  it('should handle products without features', () => {
    const productWithoutFeatures = createMockProduct({ features: null })
    render(<ProductCard product={productWithoutFeatures} />)

    expect(screen.queryByTestId('feature-tag')).not.toBeInTheDocument()
  })

  it('should have hover effects', () => {
    render(<ProductCard {...defaultProps} />)

    const card = screen.getByRole('article')
    expect(card).toHaveClass('hover:shadow-xl')
  })

  it('should display company name with building icon', () => {
    render(<ProductCard {...defaultProps} />)

    const buildingIcon = screen.getByTestId('building-icon')
    expect(buildingIcon).toBeInTheDocument()
    expect(screen.getByText('AI Solutions Ltd')).toBeInTheDocument()
  })

  it('should display pricing with dollar icon when available', () => {
    render(<ProductCard {...defaultProps} />)

    const dollarIcon = screen.getByTestId('dollar-icon')
    expect(dollarIcon).toBeInTheDocument()
  })

  it('should handle empty features array', () => {
    const productWithEmptyFeatures = createMockProduct({ features: [] })
    render(<ProductCard product={productWithEmptyFeatures} />)

    expect(screen.queryByTestId('feature-tag')).not.toBeInTheDocument()
  })
})