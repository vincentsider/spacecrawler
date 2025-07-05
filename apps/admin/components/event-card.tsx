"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  Clock,
  Users,
  Globe,
  DollarSign,
  ExternalLink,
  Check,
  X,
  Edit
} from 'lucide-react'
import type { Tables } from '@/lib/supabase/types'

type Event = Tables<'events'>

interface EventCardProps {
  event: Event
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  onEdit: (event: Event) => void
}

export function EventCard({ event, onApprove, onReject, onEdit }: EventCardProps) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(event.id)
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    await onReject(event.id)
    setLoading(false)
  }

  const formatEventDate = () => {
    const date = new Date(event.event_date)
    const formatted = format(date, 'EEEE, MMMM d, yyyy')
    
    if (event.event_time) {
      const [hours, minutes] = event.event_time.split(':')
      const time = new Date()
      time.setHours(parseInt(hours), parseInt(minutes))
      return `${formatted} at ${format(time, 'h:mm a')}`
    }
    
    return formatted
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
          {event.organizer && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{event.organizer}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {event.is_virtual && (
              <Badge variant="success">
                <Globe className="h-3 w-3 mr-1" />
                Virtual
              </Badge>
            )}
            {event.price && (
              <Badge variant="outline">
                <DollarSign className="h-3 w-3 mr-1" />
                {event.price}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{formatEventDate()}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {event.description}
            </p>
          </div>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            View Original
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          Crawled {event.crawled_at ? format(new Date(event.crawled_at), 'MMM d, yyyy h:mm a') : 'recently'}
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
          onClick={() => onEdit(event)}
          disabled={loading}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}