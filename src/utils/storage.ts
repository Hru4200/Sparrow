// Local storage utilities for data persistence
export const STORAGE_KEYS = {
  USER: 'dronenet_user',
  DRONES: 'dronenet_drones',
  RECHARGE_STOPS: 'dronenet_recharge_stops',
  RECHARGE_REQUESTS: 'dronenet_recharge_requests',
  PROPOSED_STATIONS: 'dronenet_proposed_stations',
  WELCOME_CREDITS_GRANTED: 'dronenet_welcome_credits_granted',
  THEME: 'dronenet_theme'
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

// Generate realistic mock data
export const generateMockData = () => {
  const cities = [
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Athens', lat: 37.9838, lng: 23.7275 }
  ];

  const droneModels = [
    'DJI Mavic Pro', 'DJI Air 2S', 'DJI Mini 3', 
    'Autel EVO Lite+', 'Skydio 2+', 'Parrot Anafi'
  ];

  const hostNames = [
    'Alex Chen', 'Maria Rodriguez', 'John Smith', 'Sarah Johnson',
    'David Kim', 'Emma Wilson', 'Michael Brown', 'Lisa Zhang'
  ];

  return {
    drones: cities.slice(0, 3).map((city, index) => ({
      id: `drone_${index + 1}`,
      name: `Falcon ${index + 1}`,
      model: droneModels[index % droneModels.length],
      batteryLevel: 20 + Math.floor(Math.random() * 80),
      status: ['active', 'low_battery', 'charging'][Math.floor(Math.random() * 3)] as any,
      maxRange: 15 + Math.floor(Math.random() * 35), // 15-50km range
      position: {
        lat: city.lat + (Math.random() - 0.5) * 0.02,
        lng: city.lng + (Math.random() - 0.5) * 0.02
      },
      ownerId: 'user_1'
    })),
    rechargeStops: cities.map((city, index) => ({
      id: `stop_${index + 1}`,
      name: `${city.name} Charging Hub`,
      position: {
        lat: city.lat + (Math.random() - 0.5) * 0.01,
        lng: city.lng + (Math.random() - 0.5) * 0.01
      },
      hostId: `host_${index + 1}`,
      hostName: hostNames[index % hostNames.length],
      available: Math.random() > 0.3,
      credits: Math.floor(Math.random() * 10) + 5,
      rating: 4.0 + Math.random() * 1.0
    }))
  };
};