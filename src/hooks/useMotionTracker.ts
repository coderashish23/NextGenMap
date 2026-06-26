import { useState, useEffect, useCallback, useRef } from 'react'
import type { Position } from '@/types'

interface MotionState {
  heading: number | null
  stepCount: number
  isMoving: boolean
  permissionGranted: boolean
  error: string | null
}

export function useMotionTracker() {
  const [state, setState] = useState<MotionState>({
    heading: null,
    stepCount: 0,
    isMoving: false,
    permissionGranted: false,
    error: null,
  })

  const lastStepTime = useRef(0)
  const headingRef = useRef(0)

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission !== 'granted') {
          setState(s => ({ ...s, error: 'Motion permission denied' }))
          return false
        }
      } catch {
        // iOS 16+ fallback
      }
    }
    setState(s => ({ ...s, permissionGranted: true }))
    return true
  }, [])

  useEffect(() => {
    if (!state.permissionGranted) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha
      if (alpha !== null) {
        headingRef.current = alpha
        setState(s => ({ ...s, heading: alpha }))
      }
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity
      if (!acc) return
      const magnitude = Math.sqrt(
        (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2
      )
      const now = Date.now()
      const isMoving = magnitude > 11
      setState(s => ({ ...s, isMoving }))

      if (magnitude > 12 && now - lastStepTime.current > 400) {
        lastStepTime.current = now
        setState(s => ({ ...s, stepCount: s.stepCount + 1 }))
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    window.addEventListener('devicemotion', handleMotion)

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [state.permissionGranted])

  const computePosition = useCallback((calibratedPos: Position, stepsSinceCalibration: number): Position => {
    const stepLength = 0.7 // meters per step, configurable
    const rad = (headingRef.current * Math.PI) / 180
    return {
      x: calibratedPos.x + Math.cos(rad) * stepsSinceCalibration * stepLength,
      y: calibratedPos.y + Math.sin(rad) * stepsSinceCalibration * stepLength,
      floorId: calibratedPos.floorId,
      heading: headingRef.current,
    }
  }, [])

  return { ...state, requestPermission, computePosition, rawHeading: headingRef }
}
