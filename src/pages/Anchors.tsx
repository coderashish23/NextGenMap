import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Printer } from 'lucide-react'

const demoQRAnchors = [
  { label: 'A1', floor: 'F1', desc: 'Entrance', pos: '(1.5, 10)', heading: '90°' },
  { label: 'A2', floor: 'F1', desc: 'Mid corridor', pos: '(14.5, 10)', heading: '90°' },
  { label: 'A3', floor: 'F1', desc: 'Stairs (F1)', pos: '(28.5, 10)', heading: '0°' },
  { label: 'A4', floor: 'F1', desc: 'Kitchen door', pos: '(4, 11.5)', heading: '180°' },
  { label: 'A5', floor: 'F1', desc: 'Office 1 door', pos: '(25, 8.5)', heading: '0°' },
  { label: 'B1', floor: 'F2', desc: 'Stairs (F2)', pos: '(28.5, 10)', heading: '270°' },
  { label: 'B2', floor: 'F2', desc: 'F2 mid corridor', pos: '(16, 10)', heading: '270°' },
  { label: 'B3', floor: 'F2', desc: 'Library door', pos: '(5, 11.5)', heading: '180°' },
]

export default function Anchors() {
  const navigate = useNavigate()

  const handlePrint = () => window.print()

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="self-start print:hidden">
        <ArrowLeft className="h-4 w-4" /> Home
      </Button>

      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold">Test QR anchors</h1>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to use</CardTitle>
          <CardDescription>
            Print this sheet and tape each code at its labeled location, oriented so the arrow on the sticker matches the listed heading.
            Scanning a code locks your position + calibrates the compass.
          </CardDescription>
        </CardHeader>
      </Card>

      {(['F1', 'F2'] as const).map(floor => (
        <Card key={floor}>
          <CardHeader>
            <CardTitle>Floor {floor}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoQRAnchors.filter(a => a.floor === floor).map(anchor => (
              <div key={anchor.label} className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="w-16 h-16 bg-white flex items-center justify-center border">
                  {/* QR placeholder - will use react-qr-code in production */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-200 mx-auto mb-1" />
                    <span className="text-[8px] font-mono">{anchor.label}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{anchor.label} · {anchor.desc}</p>
                  <p className="text-slate-500">{anchor.floor} · {anchor.pos} · {anchor.heading}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
