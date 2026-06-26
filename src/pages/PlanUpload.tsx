import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Map, Trash2 } from 'lucide-react'

export default function PlanUpload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [floorLabel, setFloorLabel] = useState('F1')
  const [scaleLinePx, setScaleLinePx] = useState<number>(0)
  const [scaleLineMeters, setScaleLineMeters] = useState(5)
  const [scaleMode, setScaleMode] = useState(false)
  const [scaleStart, setScaleStart] = useState<{ x: number; y: number } | null>(null)
  const [rooms, setRooms] = useState<{ name: string; x: number; y: number }[]>([])
  const [addingRoom, setAddingRoom] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageUrl) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (scaleMode) {
      if (!scaleStart) {
        setScaleStart({ x, y })
      } else {
        const dx = x - scaleStart.x
        const dy = y - scaleStart.y
        setScaleLinePx(Math.sqrt(dx * dx + dy * dy))
        setScaleStart(null)
        setScaleMode(false)
      }
      return
    }

    if (addingRoom) {
      const name = prompt('Room name:')
      if (name) {
        setRooms([...rooms, { name, x, y }])
      }
    }
  }

  const handleSaveMap = () => {
    // TODO: persist to Supabase
    navigate('/my-map')
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="self-start">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Upload floor plan</CardTitle>
          <CardDescription>
            Image or PDF · set scale · tap to drop rooms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFile}
              className="flex-1"
            />
            <Label>{floorLabel}</Label>
            <Input
              className="w-16"
              value={floorLabel}
              onChange={e => setFloorLabel(e.target.value)}
            />
          </div>

          {imageUrl && (
            <>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={scaleMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setScaleMode(!scaleMode); setAddingRoom(false) }}
                >
                  Set scale {scaleLinePx > 0 && `(${scaleLinePx.toFixed(0)}px = ${scaleLineMeters}m)`}
                </Button>
                <Button
                  variant={addingRoom ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setAddingRoom(!addingRoom); setScaleMode(false) }}
                >
                  <Map className="h-4 w-4" /> Add rooms
                </Button>
                {scaleLinePx > 0 && (
                  <div className="flex items-center gap-1">
                    <Input
                      className="w-16"
                      type="number"
                      value={scaleLineMeters}
                      onChange={e => setScaleLineMeters(Number(e.target.value))}
                    />
                    <span className="text-xs text-slate-500">m</span>
                  </div>
                )}
              </div>

              <div className="relative border rounded-lg overflow-hidden cursor-crosshair" onClick={handleImageClick}>
                <img src={imageUrl} alt="Floor plan" className="w-full h-auto" />
                {scaleStart && (
                  <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ left: scaleStart.x - 4, top: scaleStart.y - 4 }} />
                )}
                {rooms.map((room, i) => (
                  <div
                    key={i}
                    className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group"
                    style={{ left: room.x, top: room.y }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs bg-slate-900 text-white px-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {room.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveMap}>
                <Upload className="h-4 w-4" /> Save map
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
