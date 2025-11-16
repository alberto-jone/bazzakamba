export type ViewState = 'register' | 'home' | 'selection' | 'tracking' | 'rating' | 'summary' | 'prototype_feedback' | 'admin' | 'driver_mode';
export type RideStatus = 'searching' | 'pickup' | 'arrived' | 'traveling' | 'completed';

export interface RideOption {
  id: string;
  name: string;
  price: number;
  image: string;
  eta: string;
  capacity: number;
  type: 'car' | 'moto';
  color: string;
}

export interface Driver {
  name: string;
  rating: number;
  carModel: string;
  carColor: string;
  plate: string;
  trips: number;
  image: string;
}

export interface RideContextType {
  selectedRide: RideOption | null;
  setSelectedRide: (ride: RideOption) => void;
}

export interface FeedbackResponse {
  sentiment: 'positive' | 'neutral' | 'negative';
  responseMessage: string;
  followUpAction: string;
}

export interface Landmark {
  id: string;
  name: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type: 'major' | 'minor';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'driver';
  time: string;
}

// --- DATABASE TYPES ---

export type UserRole = 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Added for auth
  plate?: string; // Added for drivers
  role: UserRole; 
  registeredAt: string;
}

export interface PrototypeFeedback {
  id: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface DriverFeedback {
  id: string;
  rideRating: number;
  comment: string;
  sentiment?: string;
  submittedAt: string;
}

export interface AppStats {
  totalUsers: number;
  totalSimulations: number;
  avgRating: number;
}