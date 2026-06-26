import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMotionTracker } from '@/hooks/useMotionTracker'
import { ArrowLeft, Navigation, MapPin, ArrowUpDown, Save } from 'lucide-react'
import type { Room, Position } from '@/types'

interface SurveyRoom {
  name: string
  type: Room['type']
  x: number
  y: number
  floorId: string
}

interface StairPair {
  bottomFloor: string
  topFloor: string
  bottomPos: { x: number; y: number }
  topPos: { x: number; y: number }
}

export default function Survey() {
  const navigate = useNavigate()
  const { heading, requestPermission, permissionGranted, stepCount, isMoving, computePosition } = useMotionTracker()
  const [calibrated, setCalibrated] = useState(false)
  const [calibratedPos, setCalibratedPos] = useState<Position | null>(null)
  const [currentFloor, setCurrentFloor] = useState('f1')
  const [rooms, setRooms] = useState<SurveyRoom[]>([])
  const [stairPairs, setStairPairs] = useState<StairPair[]>([])
  const [newRoomName, setNewRoomName] = useState('')
  const [stepsAtCalibration, setStepsAtCalibration] = useState(0)
  const [surveyStep, setSurveyStep] = useState<'calibrate' | 'survey' | 'done'>('calibrate')

  const handleCalibrate = async () => {
    if (!permissionGranted) {
      const ok = await requestPermission()
      if (!ok) return
    }
    const pos: Position = { x: 0, y: 0, floorId: 'f1', heading: heading ?? 0 }
    setCalibratedPos(pos)
    setStepsAtCalibration(stepCount)
    setCalibrated(true)
    setSurveyStep('survey')
  }

  const getCurrentPos = useCallback((): Position | null => {
    if (!calibratedPos) return null
    return computePosition(calibratedPos, stepCount - stepsAtCalibration)
  }, [calibratedPos, stepCount, stepsAtCalibration, computePosition])

  const handleDropRoom = () => {
    const pos = getCurrentPos()
    if (!pos) return
    const name = newRoomName.trim() || `Room ${rooms.length + 1}`
    rooms.push({ name, type: 'room', x: pos.x, y: pos.y, floorId: currentFloor })
    setRooms([...rooms])
    setNewRoomName('')
  }

  const handleMarkStairsBottom = () => {
    const pos = getCurrentPos()
    if (!pos) return
    stairPairs.push({
      bottomFloor: currentFloor,
      topFloor: currentFloor === 'f1' ? 'f2' : 'f1',
      bottomPos: { x: pos.x, y: pos.y },
      topPos: { x: 0, y: 0 },
    })
    setStairPairs([...stairPairs])
  }

  const handleMarkStairsTop = () => {
    const pos = getCurrentPos()
    if (!pos || stairPairs.length === 0) return
    const last = stairPairs[stairPairs.length - 1]
    if (last.topPos.x === 0 && last.topPos.y === 0) {
      last.topPos = { x: pos.x, y: pos.y }
      last.topFloor = currentFloor
      setStairPairs([...stairPairs])
    }
  }

  const handleSave = () => {
    setSurveyStep('done')
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="self-start">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Survey your building</CardTitle>
          <CardDescription>
            Walk room to room — drop a point at each one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {surveyStep === 'calibrate' && (
            <div className="space-y-4">
              <ol className="list-decimal list-inside text-sm space-y-2 text-slate-600 dark:text-slate-400">
                <li>Stand at your starting point (e.g. main entrance).</li>
                <li>Face the direction you'll walk first, then tap <strong>Calibrate & Start</strong>.</li>
                <li>Walk to each room. Tap <strong>Drop room</strong> when you arrive and name it.</li>
                <li>At stairs: tap <strong>Mark stairs (bottom)</strong>, walk up, tap <strong>Mark stairs (top)</strong>.</li>
                <li>Continue mapping floor 2. Tap <strong>Save map</strong> when finished.</li>
              </ol>
              <Button onClick={handleCalibrate} size="lg" className="w-full">
                <Navigation className="h-5 w-5" /> Calibrate & Start
              </Button>
            </div>
          )}

          {surveyStep === 'survey' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Floor: <strong>{currentFloor.toUpperCase()}</strong></span>
                <span>Steps: <strong>{stepCount}</strong></span>
                {isMoving && <span className="text-green-500">● Moving</span>}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Room name"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDropRoom()}
                />
                <Button onClick={handleDropRoom}>
                  <MapPin className="h-4 w-4" /> Drop
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleMarkStairsBottom}>
                  <ArrowUpDown className="h-4 w-4" /> Stairs (bottom)
                </Button>
                <Button variant="outline" onClick={handleMarkStairsTop}>
                  <ArrowUpDown className="h-4 w-4" /> Stairs (top)
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentFloor(currentFloor === 'f1' ? 'f2' : 'f1')}
                >
                  Switch to {currentFloor === 'f1' ? 'F2' : 'F1'}
                </Button>
                <Button onClick={handleSave} className="ml-auto">
                  <Save className="h-4 w-4" /> Save map
                </Button>
              </div>

              {rooms.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Rooms ({rooms.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {rooms.map((r, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                        {r.name} ({r.floorId.toUpperCase()})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {surveyStep === 'done' && (
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">Map saved!</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {rooms.length} rooms and {stairPairs.length} stair connections recorded.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/my-map')}>View my map</Button>
                <Button variant="outline" onClick={() => navigate('/')}>Back to home</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
