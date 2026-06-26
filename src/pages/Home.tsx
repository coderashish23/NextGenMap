import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapCanvas } from '@/components/MapCanvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { useNavigation } from '@/context/NavigationContext'
import { useBuilding } from '@/hooks/useBuilding'
import { useMotionTracker } from '@/hooks/useMotionTracker'
import { buildGraph, findPath } from '@/lib/pathfinding'
import { Navigation, Compass, ArrowRight, Map, Scan } from 'lucide-react'
import type { Room, GraphNode } from '@/types'

const DEMO_BUILDING_ID = 'demo'

const demoRooms: Room[] = [
  { id: 'r1', floor_id: 'f1', name: 'Reception', type: 'entrance', x: 50, y: 50, width: 60, height: 40, polygon: null },
  { id: 'r2', floor_id: 'f1', name: 'Meeting A', type: 'room', x: 200, y: 50, width: 60, height: 40, polygon: null },
  { id: 'r3', floor_id: 'f1', name: 'Meeting B', type: 'room', x: 350, y: 50, width: 60, height: 40, polygon: null },
  { id: 'r4', floor_id: 'f1', name: 'Office 1', type: 'room', x: 500, y: 50, width: 60, height: 40, polygon: null },
  { id: 'r5', floor_id: 'f1', name: 'Kitchen', type: 'room', x: 50, y: 200, width: 60, height: 40, polygon: null },
  { id: 'r6', floor_id: 'f1', name: 'Office 2', type: 'room', x: 200, y: 200, width: 60, height: 40, polygon: null },
  { id: 'r7', floor_id: 'f1', name: 'Restroom', type: 'restroom', x: 350, y: 200, width: 60, height: 40, polygon: null },
  { id: 'r8', floor_id: 'f1', name: 'Office 3', type: 'room', x: 500, y: 200, width: 60, height: 40, polygon: null },
  { id: 'r9', floor_id: 'f2', name: 'Lounge', type: 'room', x: 50, y: 50, width: 60, height: 40, polygon: null },
  { id: 'r10', floor_id: 'f2', name: 'Lab', type: 'room', x: 200, y: 50, width: 60, height: 40, polygon: null },
  { id: 'r11', floor_id: 'f2', name: 'Class A', type: 'room', x: 350, y: 50, width: 60, height: 40, polygon: null },
  { id: 'r12', floor_id: 'f2', name: 'Library', type: 'room', x: 50, y: 200, width: 60, height: 40, polygon: null },
  { id: 'r13', floor_id: 'f2', name: 'Server Room', type: 'room', x: 200, y: 200, width: 60, height: 40, polygon: null },
  { id: 'r14', floor_id: 'f2', name: 'CEO Office', type: 'room', x: 350, y: 200, width: 60, height: 40, polygon: null },
  { id: 's1', floor_id: 'f1', name: 'Stairs (F1)', type: 'stairs', x: 650, y: 125, width: 30, height: 30, polygon: null },
  { id: 's2', floor_id: 'f2', name: 'Stairs (F2)', type: 'stairs', x: 650, y: 125, width: 30, height: 30, polygon: null },
]

const demoAnchors = [
  { id: 'a1', floor_id: 'f1', label: 'A1', x: 50, y: 50, heading: 90, qr_data: '' },
  { id: 'a2', floor_id: 'f1', label: 'A2', x: 275, y: 50, heading: 90, qr_data: '' },
  { id: 'a3', floor_id: 'f1', label: 'A3', x: 500, y: 50, heading: 90, qr_data: '' },
  { id: 'a4', floor_id: 'f1', label: 'A4', x: 500, y: 200, heading: 0, qr_data: '' },
  { id: 'a5', floor_id: 'f1', label: 'A5', x: 50, y: 200, heading: 180, qr_data: '' },
  { id: 'b1', floor_id: 'f2', label: 'B1', x: 50, y: 50, heading: 90, qr_data: '' },
  { id: 'b2', floor_id: 'f2', label: 'B2', x: 275, y: 50, heading: 90, qr_data: '' },
  { id: 'b3', floor_id: 'f2', label: 'B3', x: 50, y: 200, heading: 180, qr_data: '' },
]

export default function Home() {
  const { user } = useAuth()
  const {
    position, setPosition,
    destination, setDestination,
    path, setPath,
    isCalibrated, setIsCalibrated,
  } = useNavigation()
  const { heading, requestPermission, permissionGranted, stepCount } = useMotionTracker()

  const [selectedFloorId, setSelectedFloorId] = useState('f1')
  const [destinationId, setDestinationId] = useState<string | null>(null)
  const [showDestinationPicker, setShowDestinationPicker] = useState(false)
  const navigate = useNavigate()

  const graph = buildGraph(demoRooms, [
    { id: 'c1', from_room_id: 'r1', to_room_id: 'r2', type: 'walk', bidirectional: true },
    { id: 'c2', from_room_id: 'r2', to_room_id: 'r3', type: 'walk', bidirectional: true },
    { id: 'c3', from_room_id: 'r3', to_room_id: 'r4', type: 'walk', bidirectional: true },
    { id: 'c4', from_room_id: 'r1', to_room_id: 'r5', type: 'walk', bidirectional: true },
    { id: 'c5', from_room_id: 'r5', to_room_id: 'r6', type: 'walk', bidirectional: true },
    { id: 'c6', from_room_id: 'r6', to_room_id: 'r7', type: 'walk', bidirectional: true },
    { id: 'c7', from_room_id: 'r7', to_room_id: 'r8', type: 'walk', bidirectional: true },
    { id: 'c8', from_room_id: 'r4', to_room_id: 's1', type: 'walk', bidirectional: true },
    { id: 'c9', from_room_id: 'r8', to_room_id: 's1', type: 'walk', bidirectional: true },
    { id: 'c10', from_room_id: 'r6', to_room_id: 's1', type: 'walk', bidirectional: true },
    { id: 'c11', from_room_id: 's1', to_room_id: 's2', type: 'stairs', bidirectional: true },
    { id: 'c12', from_room_id: 's2', to_room_id: 'r9', type: 'walk', bidirectional: true },
    { id: 'c13', from_room_id: 'r9', to_room_id: 'r10', type: 'walk', bidirectional: true },
    { id: 'c14', from_room_id: 'r10', to_room_id: 'r11', type: 'walk', bidirectional: true },
    { id: 'c15', from_room_id: 'r9', to_room_id: 'r12', type: 'walk', bidirectional: true },
    { id: 'c16', from_room_id: 'r12', to_room_id: 'r13', type: 'walk', bidirectional: true },
    { id: 'c17', from_room_id: 'r13', to_room_id: 'r14', type: 'walk', bidirectional: true },
    { id: 'c18', from_room_id: 's2', to_room_id: 'r11', type: 'walk', bidirectional: true },
    { id: 'c19', from_room_id: 's2', to_room_id: 'r14', type: 'walk', bidirectional: true },
  ])

  const floors = [
    { id: 'f1', label: 'F1', floor_number: 1 },
    { id: 'f2', label: 'F2', floor_number: 2 },
  ]

  const handleRoomClick = (room: Room) => {
    setDestinationId(room.id)
    const startNode = position
      ? graph.get(position.floorId === 'f1' ? 'r1' : 'r9')
      : graph.get('r1')
    const endNode = graph.get(room.id)
    if (startNode && endNode) {
      const foundPath = findPath(graph, startNode.id, endNode.id)
      setPath(foundPath)
      const dest = graph.get(room.id) ?? null
      setDestination(dest)
    }
  }

  const handleScanQR = () => {
    navigate('/scan')
  }

  const demoDestinations = demoRooms.map(r => ({
    ...r,
    floorLabel: r.floor_id === 'f1' ? 'F1' : 'F2',
  }))

  const groupedDestinations = Object.groupBy(demoDestinations, (r: typeof demoDestinations[number]) => r.floorLabel) as Record<string, typeof demoDestinations>

  return (
    <div className="flex-1 flex flex-col">
      {/* Status Bar */}
      <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
        <Badge variant={isCalibrated ? 'default' : 'outline'}>
          {isCalibrated ? 'Calibrated' : 'Not calibrated'}
        </Badge>
        {heading !== null && (
          <span className="flex items-center gap-1">
            <Compass className="h-3 w-3" /> {heading.toFixed(0)}°
          </span>
        )}
        {stepCount > 0 && <span>Steps: {stepCount}</span>}
        {position && (
          <span>
            ({position.x.toFixed(0)}, {position.y.toFixed(0)})
          </span>
        )}
      </div>

      {/* Destination Picker */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDestinationPicker(!showDestinationPicker)}>
            {destination ? destination.name : 'Where are you going?'}
            <ArrowRight className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleScanQR} title="Scan QR">
            <Scan className="h-4 w-4" />
          </Button>
        </div>
        {showDestinationPicker && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-48 overflow-y-auto">
            {Object.entries(groupedDestinations).map(([floor, rooms]) => (
              <div key={floor}>
                <p className="text-xs font-medium text-slate-500 px-2 py-1">{floor}</p>
                {rooms?.map(room => (
                  <button
                    key={room.id}
                    className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${destinationId === room.id ? 'bg-slate-100 dark:bg-slate-800 font-medium' : ''}`}
                    onClick={() => handleRoomClick(room)}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floor Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
        {floors.map(floor => (
          <button
            key={floor.id}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedFloorId === floor.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setSelectedFloorId(floor.id)}
          >
            {floor.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 p-4">
        <MapCanvas
          rooms={demoRooms}
          anchors={demoAnchors}
          position={position}
          path={path}
          selectedFloorId={selectedFloorId}
          onRoomClick={handleRoomClick}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
        <Button onClick={() => navigate('/survey')} variant="outline">
          <Navigation className="h-4 w-4" /> Walk Survey
        </Button>
        <Button onClick={() => navigate('/plan')} variant="outline">
          <Map className="h-4 w-4" /> Upload Plan
        </Button>
      </div>
    </div>
  )
}
