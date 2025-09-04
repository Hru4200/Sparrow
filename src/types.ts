export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
}

export interface Position {
  lat: number;
  lng: number;
}

export interface Drone {
  id: string;
  name: string;
  model: string;
  batteryLevel: number;
  status: 'active' | 'low_battery' | 'charging' | 'offline';
  position: Position;
  ownerId: string;
  maxRange: number; // Maximum flight range in kilometers
  currentRoute?: Route;
  maxRange: number; // Maximum flight range in kilometers
  currentRoute?: Route;
}

export interface Route {
  id: string;
  droneId: string;
  waypoints: Position[];
  totalDistance: number;
  estimatedBatteryUsage: number;
  chargingStops: string[]; // IDs of recharge stops along the route
  createdAt: Date;
  status: 'planned' | 'active' | 'completed';
}

export interface ProposedStation {
  id: string;
  userId: string;
  userName: string;
  position: Position;
  description: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  submissionDate: Date;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Route {
  id: string;
  droneId: string;
  waypoints: Position[];
  totalDistance: number;
  estimatedBatteryUsage: number;
  chargingStops: string[]; // IDs of recharge stops along the route
  createdAt: Date;
  status: 'planned' | 'active' | 'completed';
}

export interface ProposedStation {
  id: string;
  userId: string;
  userName: string;
  position: Position;
  description: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  submissionDate: Date;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RechargeStop {
  id: string;
  name: string;
  position: Position;
  hostId: string;
  hostName: string;
  available: boolean;
  credits: number;
  rating: number;
}

export interface RechargeRequest {
  id: string;
  droneId: string;
  stopId: string;
  requesterId: string;
  hostId: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  credits: number;
  createdAt: Date;
  estimatedDuration: number;
}