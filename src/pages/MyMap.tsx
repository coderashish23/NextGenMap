import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Map, QrCode } from 'lucide-react'

export default function MyMap() {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>My building map</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to save and manage your building maps.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="self-start">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>My building map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your custom indoor map. No saved map yet. Walk through your building first.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/survey')}>
              <Map className="h-4 w-4" /> Start surveying
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-anchors')}>
              <QrCode className="h-4 w-4" /> My QRs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
