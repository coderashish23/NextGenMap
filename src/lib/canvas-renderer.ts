import type { Room, Anchor, Position, GraphNode } from '@/types'

interface DrawOptions {
  rooms: Room[]
  anchors: Anchor[]
  position: Position | null
  path: GraphNode[]
  selectedFloorId: string
  scale: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  onRoomClick?: (roomId: string) => void
}

const COLORS: Record<string, string> = {
  room: '#e2e8f0',
  corridor: '#f1f5f9',
  stairs: '#dbeafe',
  elevator: '#fef3c7',
  entrance: '#dcfce7',
  restroom: '#fce7f3',
}

const STROKE_COLORS: Record<string, string> = {
  room: '#94a3b8',
  corridor: '#cbd5e1',
  stairs: '#93c5fd',
  elevator: '#fde68a',
  entrance: '#86efac',
  restroom: '#fbcfe8',
}

export function renderMap(ctx: CanvasRenderingContext2D, options: DrawOptions) {
  const { rooms, anchors, position, path, selectedFloorId, scale, offsetX, offsetY, width, height } = options

  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)

  // Background grid
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 0.5 / scale
  for (let x = 0; x < 100; x += 5) {
    for (let y = 0; y < 100; y += 5) {
      ctx.strokeRect(x, y, 5, 5)
    }
  }

  // Draw rooms
  const floorRooms = rooms.filter(r => r.floor_id === selectedFloorId)
  for (const room of floorRooms) {
    ctx.fillStyle = COLORS[room.type] ?? '#e2e8f0'
    ctx.strokeStyle = STROKE_COLORS[room.type] ?? '#94a3b8'
    ctx.lineWidth = 2 / scale

    if (room.polygon) {
      ctx.beginPath()
      ctx.moveTo(room.polygon[0][0], room.polygon[0][1])
      for (let i = 1; i < room.polygon.length; i++) {
        ctx.lineTo(room.polygon[i][0], room.polygon[i][1])
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.fillRect(room.x - room.width / 2, room.y - room.height / 2, room.width, room.height)
      ctx.strokeRect(room.x - room.width / 2, room.y - room.height / 2, room.width, room.height)
    }

    // Room label
    ctx.fillStyle = '#1e293b'
    ctx.font = `${12 / scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(room.name, room.x, room.y - 15 / scale)
  }

  // Draw path
  if (path.length > 1) {
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 4 / scale
    ctx.setLineDash([])
    ctx.beginPath()
    const floorPath = path.filter(n => n.floorId === selectedFloorId)
    if (floorPath.length > 0) {
      ctx.moveTo(floorPath[0].x, floorPath[0].y)
      for (let i = 1; i < floorPath.length; i++) {
        ctx.lineTo(floorPath[i].x, floorPath[i].y)
      }
      ctx.stroke()
    }
  }

  // Draw anchors
  const floorAnchors = anchors.filter(a => a.floor_id === selectedFloorId)
  for (const anchor of floorAnchors) {
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(anchor.x - 5 / scale, anchor.y - 5 / scale, 10 / scale, 10 / scale)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${8 / scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(anchor.label, anchor.x, anchor.y)

    // Heading arrow
    const rad = (anchor.heading * Math.PI) / 180
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 1.5 / scale
    ctx.beginPath()
    const arrowLen = 12 / scale
    ctx.moveTo(anchor.x, anchor.y)
    ctx.lineTo(anchor.x + Math.cos(rad) * arrowLen, anchor.y + Math.sin(rad) * arrowLen)
    ctx.stroke()
  }

  // Draw user position
  if (position && position.floorId === selectedFloorId) {
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(position.x, position.y, 8 / scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(position.x, position.y, 3 / scale, 0, Math.PI * 2)
    ctx.fill()

    // Heading cone
    const rad = ((position.heading ?? 0) * Math.PI) / 180
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
    ctx.beginPath()
    ctx.moveTo(position.x, position.y)
    ctx.arc(position.x, position.y, 20 / scale, rad - 0.5, rad + 0.5)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

export function getClickCoords(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (clientX - rect.left - offsetX) / scale,
    y: (clientY - rect.top - offsetY) / scale,
  }
}

export function hitTestRoom(
  rooms: Room[],
  floorId: string,
  x: number,
  y: number
): Room | null {
  const floorRooms = rooms.filter(r => r.floor_id === floorId)
  for (const room of floorRooms.reverse()) {
    if (room.polygon) {
      if (pointInPolygon(x, y, room.polygon)) return room
    } else {
      if (
        x >= room.x - room.width / 2 &&
        x <= room.x + room.width / 2 &&
        y >= room.y - room.height / 2 &&
        y <= room.y + room.height / 2
      ) return room
    }
  }
  return null
}

function pointInPolygon(px: number, py: number, polygon: number[][]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]
    const xj = polygon[j][0], yj = polygon[j][1]
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}
