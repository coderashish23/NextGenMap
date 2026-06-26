import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useNavigation } from '@/context/NavigationContext'
import { useMotionTracker } from '@/hooks/useMotionTracker'
import { decodeQR } from '@/lib/qr-utils'
import { ArrowLeft, Compass, Smartphone } from 'lucide-react'
import type { Position } from '@/types'

export default function Scan() {
  const navigate = useNavigate()
  const { setPosition, setIsCalibrated } = useNavigation()
  const { heading, requestPermission, permissionGranted } = useMotionTracker()
  const [scanned, setScanned] = useState(false)
  const [anchorInfo, setAnchorInfo] = useState<string>('')
  const [motionGranted, setMotionGranted] = useState(false)

  const handleScan = useCallback((detectedCodes: { rawValue: string }[]) => {
    if (scanned || detectedCodes.length === 0) return
    const code = detectedCodes[0]
    const payload = decodeQR(code.rawValue)
    if (!payload) {
      setAnchorInfo('Invalid QR code')
      return
    }

    const floorId = payload.floorNumber === 1 ? 'f1' : 'f2'
    const pos: Position = {
      x: payload.x,
      y: payload.y,
      floorId,
      heading: payload.heading,
    }
    setPosition(pos)
    setIsCalibrated(true)
    setScanned(true)
    setAnchorInfo(`Calibrated at ${payload.label} (${payload.x}, ${payload.y}) heading ${payload.heading}°`)
  }, [scanned, setPosition, setIsCalibrated])

  const handleMotionPermission = async () => {
    const granted = await requestPermission()
    setMotionGranted(granted)
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="self-start">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Scan QR Anchor</CardTitle>
          <CardDescription>
            Point your camera at a QR anchor sticker to calibrate your position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!motionGranted && !permissionGranted && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
              <p className="font-medium flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4" /> Enable motion sensors
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                We need motion and orientation access to track your steps and direction.
              </p>
              <Button onClick={handleMotionPermission} size="sm">
                <Compass className="h-4 w-4" /> Grant access
              </Button>
            </div>
          )}

          <div className="aspect-square max-w-sm mx-auto overflow-hidden rounded-lg bg-black relative">
            <Scanner
              onScan={handleScan}
              styles={{ container: { width: '100%', height: '100%' } }}
              allowMultiple={false}
              constraints={{ facingMode: 'environment' }}
            />
            {scanned && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <p className="text-lg font-bold mb-2">✓ Calibrated</p>
                  <p className="text-sm">{anchorInfo}</p>
                  <Button className="mt-4" onClick={() => navigate('/')}>
                    Start navigating
                  </Button>
                </div>
              </div>
            )}
          </div>

          {anchorInfo && !scanned && (
            <p className="mt-2 text-sm text-red-500">{anchorInfo}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Heading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            <span className="text-2xl font-bold">
              {heading !== null ? `${heading.toFixed(0)}°` : '—'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
