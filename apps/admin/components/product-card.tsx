"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  Globe,
  DollarSign,
  ExternalLink,
  Check,
  X,
  Edit,
  Zap,
  List
} from 'lucide-react'
import type { Tables } from '@/lib/supabase/types'

type Product = Tables<'products'>

interface ProductCardProps {
  product: Product
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  onEdit: (product: Product) => void
}

export function ProductCard({ product, onApprove, onReject, onEdit }: ProductCardProps) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(product.id)
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    await onReject(product.id)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-3 w-3" />
            <span>{product.company_name}</span>
          </div>
          {product.tagline && (
            <p className="text-sm text-muted-foreground italic">{product.tagline}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.short_description && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Quick Summary</h4>
            <p className="text-sm text-muted-foreground">{product.short_description}</p>
          </div>
        )}

        {product.full_description && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {product.full_description}
            </p>
          </div>
        )}

        {product.key_features && product.key_features.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Key Features
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {product.key_features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {product.key_features.length > 3 && (
                <li className="text-xs text-muted-foreground/70">
                  +{product.key_features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {product.use_cases && product.use_cases.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.use_cases.slice(0, 3).map((useCase, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {useCase}
              </Badge>
            ))}
          </div>
        )}

        {product.pricing_model && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span>{product.pricing_model}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <a
            href={product.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <Globe className="h-3 w-3" />
            Website
          </a>
          {product.demo_url && (
            <a
              href={product.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Demo
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          Crawled {product.crawled_at ? format(new Date(product.crawled_at), 'MMM d, yyyy h:mm a') : 'recently'}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={handleApprove}
          disabled={loading}
          className="flex-1"
        >
          <Check className="h-3 w-3 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleReject}
          disabled={loading}
          className="flex-1"
        >
          <X className="h-3 w-3 mr-1" />
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(product)}
          disabled={loading}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}