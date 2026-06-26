import { useRef, useEffect, useCallback } from 'react'
import { renderMap, getClickCoords, hitTestRoom } from '@/lib/canvas-renderer'
import type { Room, Anchor, Position, GraphNode } from '@/types'

interface MapCanvasProps {
  rooms: Room[]
  anchors: Anchor[]
  position: Position | null
  path: GraphNode[]
  selectedFloorId: string
  onRoomClick?: (room: Room) => void
}

export function MapCanvas({ rooms, anchors, position, path, selectedFloorId, onRoomClick }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const offsetX = 20
  const offsetY = 20
  const scale = 1.5

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderMap(ctx, {
      rooms, anchors, position, path, selectedFloorId,
      scale, offsetX, offsetY,
      width: canvas.width, height: canvas.height,
    })
  }, [rooms, anchors, position, path, selectedFloorId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
      draw()
    }
    resize()
    window.addEventListener('resize', resize)
    animRef.current = requestAnimationFrame(function loop() {
      draw()
      animRef.current = requestAnimationFrame(loop)
    })
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [draw])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onRoomClick) return
    const { x, y } = getClickCoords(canvasRef.current, e.clientX, e.clientY, offsetX, offsetY, scale)
    const room = hitTestRoom(rooms, selectedFloorId, x, y)
    if (room) onRoomClick(room)
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800"
      onClick={handleClick}
    />
  )
}
