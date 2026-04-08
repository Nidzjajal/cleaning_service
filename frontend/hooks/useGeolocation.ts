'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Location {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: number
}

interface UseGeolocationReturn {
  location: Location | null
  error: string | null
  isTracking: boolean
  startTracking: () => void
  stopTracking: () => void
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsTracking(true)
    setError(null)

    // Get initial position immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    )

    // Watch position continuously (battery-efficient: only when ON_THE_WAY)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
        setError(null)
      },
      (err) => {
        setError(err.message)
        console.error('Geolocation error:', err)
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000, // Accept cached position up to 10s old
      }
    )
  }, [])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return { location, error, isTracking, startTracking, stopTracking }
}

export default useGeolocation
