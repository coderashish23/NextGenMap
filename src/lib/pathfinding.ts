import type { GraphNode, Connection, Room, Position } from '@/types'

interface AStarNode {
  id: string
  g: number
  h: number
  f: number
  parent: AStarNode | null
}

export function buildGraph(rooms: Room[], connections: Connection[]): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>()

  for (const room of rooms) {
    graph.set(room.id, {
      id: room.id,
      roomId: room.id,
      floorId: room.floor_id,
      x: room.x,
      y: room.y,
      name: room.name,
      type: room.type,
      connections: [],
    })
  }

  for (const conn of connections) {
    const from = graph.get(conn.from_room_id)
    const to = graph.get(conn.to_room_id)
    if (from && to) {
      from.connections.push({ nodeId: to.id, type: conn.type })
      if (conn.bidirectional) {
        to.connections.push({ nodeId: from.id, type: conn.type })
      }
    }
  }

  return graph
}

function heuristic(a: GraphNode, b: GraphNode): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const floorDiff = a.floorId !== b.floorId ? 1000 : 0
  return Math.sqrt(dx * dx + dy * dy) + floorDiff
}

export function findPath(
  graph: Map<string, GraphNode>,
  startId: string,
  endId: string
): GraphNode[] {
  const start = graph.get(startId)
  const end = graph.get(endId)
  if (!start || !end) return []

  const open: AStarNode[] = [{ id: startId, g: 0, h: heuristic(start, end), f: heuristic(start, end), parent: null }]
  const closed = new Set<string>()

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f)
    const current = open.shift()!

    if (current.id === endId) {
      const path: GraphNode[] = []
      let node: AStarNode | null = current
      while (node) {
        const gn = graph.get(node.id)
        if (gn) path.unshift(gn)
        node = node.parent
      }
      return path
    }

    closed.add(current.id)
    const currentGraphNode = graph.get(current.id)
    if (!currentGraphNode) continue

    for (const edge of currentGraphNode.connections) {
      if (closed.has(edge.nodeId)) continue
      const neighbor = graph.get(edge.nodeId)
      if (!neighbor) continue

      const g = current.g + heuristic(currentGraphNode, neighbor)
      const existing = open.find(n => n.id === edge.nodeId)
      if (existing) {
        if (g < existing.g) {
          existing.g = g
          existing.f = g + existing.h
          existing.parent = current
        }
      } else {
        open.push({
          id: edge.nodeId,
          g,
          h: heuristic(neighbor, end),
          f: g + heuristic(neighbor, end),
          parent: current,
        })
      }
    }
  }

  return []
}

export function findNearestRoom(graph: Map<string, GraphNode>, pos: Position): GraphNode | null {
  let nearest: GraphNode | null = null
  let minDist = Infinity
  for (const node of graph.values()) {
    if (node.floorId !== pos.floorId) continue
    const dx = node.x - pos.x
    const dy = node.y - pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < minDist) {
      minDist = dist
      nearest = node
    }
  }
  return nearest
}
