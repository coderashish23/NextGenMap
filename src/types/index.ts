export interface Building {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Floor {
  id: string
  building_id: string
  floor_number: number
  label: string
  width: number
  height: number
  image_url: string | null
  scale_px_per_meter: number
  sort_order: number
}

export interface Room {
  id: string
  floor_id: string
  name: string
  type: RoomType
  x: number
  y: number
  width: number
  height: number
  polygon: number[][] | null
}

export type RoomType = 'room' | 'corridor' | 'stairs' | 'elevator' | 'entrance' | 'restroom'

export interface Connection {
  id: string
  from_room_id: string
  to_room_id: string
  type: ConnectionType
  bidirectional: boolean
}

export type ConnectionType = 'walk' | 'stairs' | 'elevator'

export interface Anchor {
  id: string
  floor_id: string
  label: string
  x: number
  y: number
  heading: number
  qr_data: string
}

export interface NavSession {
  id: string
  user_id: string
  building_id: string
  current_floor_id: string
  current_x: number
  current_y: number
  current_heading: number
  destination_room_id: string | null
  started_at: string
  ended_at: string | null
}

export interface GraphNode {
  id: string
  roomId: string
  floorId: string
  x: number
  y: number
  name: string
  type: RoomType
  connections: { nodeId: string; type: ConnectionType }[]
}

export interface Position {
  x: number
  y: number
  floorId: string
  heading: number
}

export interface QRPayload {
  version: string
  buildingId: string
  floorNumber: number
  x: number
  y: number
  heading: number
  label: string
}
