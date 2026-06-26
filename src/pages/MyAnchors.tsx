import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Printer } from 'lucide-react'

export default function MyAnchors() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="self-start">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>My map QRs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No saved map yet. Survey your building first.
          </p>
          <Button className="mt-4" onClick={() => navigate('/survey')}>
            Start surveying
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
