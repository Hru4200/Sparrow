import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    type: 'drone' | 'station' | 'proposal';
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  routes?: Array<{
    id: string;
    points: [number, number][];
    color: string;
  }>;
  className?: string;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function InteractiveMap({ 
  center = [37.7749, -122.4194], 
  zoom = 10, 
  markers = [], 
  onMapClick,
  routes = [],
  className = "h-96"
}: MapProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for map tiles
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getMarkerIcon = (type: string) => {
    const iconColors = {
      drone: '#10B981', // green
      station: '#3B82F6', // blue
      proposal: '#F59E0B' // yellow
    };

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${iconColors[type as keyof typeof iconColors] || '#6B7280'}"/>
          <circle cx="12.5" cy="12.5" r="6" fill="white"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-800 rounded-lg flex items-center justify-center`}>
        <div className="text-white">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={getMarkerIcon(marker.type)}
          >
            <Popup>
              <div className="text-gray-900">
                <h3 className="font-semibold">{marker.title}</h3>
                <p className="text-sm">Type: {marker.type}</p>
                <p className="text-xs">
                  {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.points}
            color={route.color}
            weight={3}
            opacity={0.8}
            dashArray="10, 10"
          />
        ))}
      </MapContainer>
    </div>
  );
}