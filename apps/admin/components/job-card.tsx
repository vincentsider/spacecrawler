"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  Building, 
  DollarSign,
  ExternalLink,
  Check,
  X,
  Edit
} from 'lucide-react'
import type { Tables } from '@/lib/supabase/types'

type Job = Tables<'jobs'>

interface JobCardProps {
  job: Job
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  onEdit: (job: Job) => void
}

export function JobCard({ job, onApprove, onReject, onEdit }: JobCardProps) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(job.id)
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    await onReject(job.id)
    setLoading(false)
  }

  const getLocationTypeBadge = () => {
    if (!job.location_type) return null
    
    const variants = {
      remote: 'success',
      hybrid: 'warning',
      onsite: 'secondary'
    } as const

    return (
      <Badge variant={variants[job.location_type]}>
        {job.location_type.charAt(0).toUpperCase() + job.location_type.slice(1)}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-tight">{job.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-3 w-3" />
              <span>{job.company_name}</span>
            </div>
          </div>
          {getLocationTypeBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          {job.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
          )}
          {job.salary_range && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span>{job.salary_range}</span>
            </div>
          )}
          {job.publication_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>Posted {format(new Date(job.publication_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {job.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {job.description}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            View Original
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          Crawled {job.crawled_at ? format(new Date(job.crawled_at), 'MMM d, yyyy h:mm a') : 'recently'}
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
          onClick={() => onEdit(job)}
          disabled={loading}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}