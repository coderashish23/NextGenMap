import type { QRPayload } from '@/types'

const QR_PREFIX = 'INDOOR_NAV'
const QR_VERSION = 'v1'

export function encodeQR(payload: QRPayload): string {
  return [
    QR_PREFIX,
    QR_VERSION,
    payload.buildingId,
    payload.floorNumber,
    payload.x.toFixed(1),
    payload.y.toFixed(1),
    payload.heading.toFixed(1),
    payload.label,
  ].join(':')
}

export function decodeQR(data: string): QRPayload | null {
  const parts = data.split(':')
  if (parts[0] !== QR_PREFIX || parts[1] !== QR_VERSION) return null
  return {
    version: parts[1],
    buildingId: parts[2],
    floorNumber: Number(parts[3]),
    x: Number(parts[4]),
    y: Number(parts[5]),
    heading: Number(parts[6]),
    label: parts[7],
  }
}


