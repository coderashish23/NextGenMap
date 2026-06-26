import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Map, QrCode, Scan, Navigation, LogOut } from 'lucide-react'

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex h-14 items-center gap-4 px-4 max-w-5xl mx-auto w-full">
          <Link to="/" className="font-bold text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Wayfinder
          </Link>
          <nav className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Map className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/scan')}>
              <Scan className="h-4 w-4" />
            </Button>
            {user && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-map')}>
                  <Map className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
