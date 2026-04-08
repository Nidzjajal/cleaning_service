import { useState, useCallback, useEffect } from 'react'
import { GoogleMap, MarkerF, DirectionsRenderer, useLoadScript } from '@react-google-maps/api'
import LoadingSpinner from '../ui/LoadingSpinner'

interface TrackingMapProps {
  customerLocation: { lat: number; lng: number }
  providerLocation: { lat: number; lng: number } | null
  status: string
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '1.5rem',
  backgroundColor: '#f3f4f6'
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["geometry", "places"]

export default function TrackingMap({ customerLocation, providerLocation, status }: TrackingMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    console.log('[TRACKING_MAP] Coords:', { customerLocation, providerLocation, isLoaded })
  }, [customerLocation, providerLocation, isLoaded])

  const center = providerLocation || customerLocation

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  useEffect(() => {
    if (isLoaded && providerLocation && window.google) {
      const directionsService = new google.maps.DirectionsService()
      directionsService.route(
        {
          origin: providerLocation,
          destination: customerLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result)
          } else {
             console.error('[TRACKING_MAP] Directions failed:', status)
          }
        }
      )
    }
  }, [isLoaded, providerLocation, customerLocation])

  if (loadError) {
    console.error('[TRACKING_MAP] Load Error:', loadError)
    return <div className="card p-8 text-center text-red-500 font-bold uppercase tracking-widest bg-red-50 border-red-100">Map failed to load: {loadError.message}</div>
  }
  if (!isLoaded) return <LoadingSpinner text="Initializing secure satellite link..." />

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }, { lightness: -80 }],
          },
          {
             featureType: 'water',
             elementType: 'geometry',
             stylers: [{ color: '#17263c' }],
          }
        ],
      }}
    >
      {/* Customer Marker */}
      <MarkerF
        position={customerLocation}
        icon={{
          url: 'https://cdn-icons-png.flaticon.com/512/1216/1216844.png',
          scaledSize: new window.google.maps.Size(40, 40),
        }}
        title="Your Location"
      />

      {/* Provider Marker */}
      {providerLocation && (
        <MarkerF
          position={providerLocation}
          icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
            scaledSize: new window.google.maps.Size(50, 50),
          }}
          title="Helper is here"
        />
      )}

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: '#4F46E5', // Accent color
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
            markerOptions: { visible: false },
          }}
        />
      )}
    </GoogleMap>
  )
}
