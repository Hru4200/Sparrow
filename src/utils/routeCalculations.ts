// Route planning and distance calculation utilities

export interface RoutePoint {
  lat: number;
  lng: number;
  type: 'waypoint' | 'charging_station' | 'start' | 'end';
  id?: string;
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate total route distance
export function calculateRouteDistance(waypoints: RoutePoint[]): number {
  if (waypoints.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
  }
  
  return totalDistance;
}

// Estimate battery usage based on distance and drone characteristics
export function estimateBatteryUsage(distance: number, droneModel: string): number {
  // Battery consumption rates per km for different drone models
  const consumptionRates: { [key: string]: number } = {
    'DJI Mavic Pro': 8, // 8% per km
    'DJI Air 2S': 7,
    'DJI Mini 3': 6,
    'Autel EVO Lite+': 9,
    'Skydio 2+': 10,
    'Parrot Anafi': 8
  };
  
  const rate = consumptionRates[droneModel] || 8; // Default 8% per km
  return Math.min(100, distance * rate);
}

// Validate if route is within drone's capabilities
export function validateRoute(
  waypoints: RoutePoint[], 
  maxRange: number, 
  currentBattery: number,
  droneModel: string
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const totalDistance = calculateRouteDistance(waypoints);
  const estimatedUsage = estimateBatteryUsage(totalDistance, droneModel);
  
  if (totalDistance > maxRange) {
    issues.push(`Route distance (${totalDistance.toFixed(1)} km) exceeds drone's maximum range of ${maxRange} km`);
  }
  
  if (estimatedUsage > currentBattery) {
    issues.push(`Estimated battery usage (${estimatedUsage.toFixed(1)}%) exceeds current battery level (${currentBattery}%)`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Find optimal charging stations along route
export function findOptimalChargingStations(
  waypoints: RoutePoint[],
  availableStations: any[],
  maxRange: number
): string[] {
  const optimalStations: string[] = [];
  let currentDistance = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segmentDistance = calculateDistance(waypoints[i], waypoints[i + 1]);
    currentDistance += segmentDistance;
    
    if (currentDistance >= maxRange * 0.8) { // 80% of max range
      // Find nearest available station
      const nearestStation = availableStations
        .filter(station => station.available)
        .reduce((nearest, station) => {
          const distanceToStation = calculateDistance(waypoints[i], station.position);
          const distanceToNearest = nearest ? calculateDistance(waypoints[i], nearest.position) : Infinity;
          return distanceToStation < distanceToNearest ? station : nearest;
        }, null);
      
      if (nearestStation) {
        optimalStations.push(nearestStation.id);
        currentDistance = 0; // Reset after charging
      }
    }
  }
  
  return optimalStations;
}