import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Building, Floor, Room, Connection, Anchor } from '@/types'

export function useBuilding(buildingId: string | undefined) {
  const [building, setBuilding] = useState<Building | null>(null)
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!buildingId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const [buildingRes, floorsRes] = await Promise.all([
          supabase.from('buildings').select('*').eq('id', buildingId).single(),
          supabase.from('floors').select('*').eq('building_id', buildingId).order('sort_order'),
        ])
        if (buildingRes.error) throw buildingRes.error
        setBuilding(buildingRes.data)
        const floorData: Floor[] = (floorsRes.data ?? []) as Floor[]
        setFloors(floorData)
        const floorIds = floorData.map(f => f.id)

        if (floorIds.length > 0) {
          const [roomsRes, anchorsRes] = await Promise.all([
            supabase.from('rooms').select('*').in('floor_id', floorIds),
            supabase.from('anchors').select('*').in('floor_id', floorIds),
          ])
          setRooms(roomsRes.data ?? [])
          setAnchors(anchorsRes.data ?? [])
          const roomIds = ((roomsRes.data ?? []) as Room[]).map(r => r.id)
          if (roomIds.length > 0) {
            const connRes = await supabase.from('connections').select('*').in('from_room_id', roomIds)
            setConnections(connRes.data ?? [])
          }
        }
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [buildingId])

  return { building, floors, rooms, connections, anchors, loading, error }
}
