import { Sidebar } from '@/components/sidebar'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userInfo = {
    email: user.email,
    full_name: profile?.full_name,
    avatar_url: profile?.avatar_url,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={userInfo} />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with breadcrumbs */}
        <header className="h-16 border-b bg-background px-6 flex items-center">
          <Breadcrumbs />
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/50">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}