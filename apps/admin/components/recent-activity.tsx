import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, Calendar, Briefcase } from "lucide-react"

interface Activity {
  id: string
  title: string
  created_at: string
  type: 'job' | 'event' | 'product'
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'product':
        return <Package className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: Activity['type']) => {
    switch (type) {
      case 'job':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Job</Badge>
      case 'event':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Event</Badge>
      case 'product':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Product</Badge>
    }
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[350px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-2 bg-muted rounded-full">
                {getIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-5 line-clamp-2">
                  {activity.title}
                </p>
                {getTypeBadge(activity.type)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}