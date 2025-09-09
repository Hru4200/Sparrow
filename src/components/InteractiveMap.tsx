import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    type: 'drone' | 'station' | 'proposal';
    title: string;
    description?: string;
    onClick?: () => void;
  }>;
  routes?: Array<{
    positions: [number, number][];
    color: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

// Custom icons
const droneIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMTBCOTgxIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const stationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjhIMTBWNEMxMCAyLjkgMTAuOSAyIDEyIDJaTTIxIDlWN0gxNVY5SDIxWk05IDlWN0gzVjlIOVpNMTYgMTBWMjJIMTRWMTBIMTZaTTEwIDEwVjIySDhWMTBIMTBaIiBmaWxsPSIjRjU5RTBCIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const proposalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRUFCMzA4Ii8+Cjwvc3ZnPgo=',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

export default function InteractiveMap({
  center,
  zoom,
  markers = [],
  routes = [],
  onMapClick,
  className = "h-96 w-full rounded-lg"
}: MapProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'drone': return droneIcon;
      case 'station': return stationIcon;
      case 'proposal': return proposalIcon;
      default: return undefined;
    }
  };

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={getIcon(marker.type)}
            eventHandlers={{
              click: marker.onClick
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold mb-1">{marker.title}</h3>
                {marker.description && <p className="text-gray-600">{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.positions}
            color={route.color}
            weight={3}
            opacity={0.8}
            dashArray={route.color === 'red' ? '10, 5' : undefined}
          />
        ))}
      </MapContainer>
    </div>
  );
}