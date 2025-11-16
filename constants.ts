import { RideOption, Driver, Landmark } from './types';

export const RIDE_OPTIONS: RideOption[] = [
  {
    id: 'moto',
    name: 'Motorizada',
    price: 800, // 800 Kz
    image: 'moto',
    eta: '2 min',
    capacity: 1,
    type: 'moto',
    color: '#FACC15' // Yellow
  },
  {
    id: 'economy',
    name: 'Econômico',
    price: 2000, // 2.000 Kz
    image: 'compact',
    eta: '4 min',
    capacity: 4,
    type: 'car',
    color: '#6B7280' // Gray
  },
  {
    id: 'standard',
    name: 'Conforto',
    price: 3500, // 3.500 Kz
    image: 'sedan',
    eta: '6 min',
    capacity: 4,
    type: 'car',
    color: '#007FF0' // Blue
  },
  {
    id: 'luxury',
    name: 'Luxuoso',
    price: 7000, // 7.000 Kz
    image: 'suv',
    eta: '8 min',
    capacity: 6,
    type: 'car',
    color: '#000000' // Black
  }
];

export const MOCK_DRIVER: Driver = {
  name: 'Paulo "Bazza" Silva',
  rating: 4.9,
  carModel: 'Toyota Corolla',
  carColor: 'Azul',
  plate: 'LD-22-44-GX',
  trips: 1240,
  image: '/motorista.jpg'
};

// Simplified coordinate map for the Dande/Caxito/Panguila axis
// Adjusted for a vertical scroller map path
export const LANDMARKS: Landmark[] = [
  // Panguila Area (Start/Driver Origin)
  { id: 'panguila', name: 'Panguila', x: 10, y: 95, type: 'major' },
  { id: 'sec3', name: 'Sector 3 - Panguila', x: 25, y: 92, type: 'minor' },
  { id: 'mercado', name: 'Mercado do Panguila', x: 20, y: 88, type: 'minor' },
  { id: 'bairro-j', name: 'Bairro J', x: 15, y: 82, type: 'minor' },
  { id: 'kapari', name: 'Centralidade do Kapari', x: 5, y: 75, type: 'major' },
  
  // The Road Up
  { id: 'unitel', name: 'Loja da Unitel', x: 35, y: 78, type: 'minor' },
  { id: 'agt', name: 'AGT', x: 40, y: 72, type: 'minor' },
  { id: 'ende', name: 'ENDE', x: 42, y: 68, type: 'minor' },
  { id: 'sme', name: 'SME', x: 45, y: 65, type: 'minor' },
  
  // Desvio Area
  { id: 'barra', name: 'Desvio da Barra', x: 50, y: 60, type: 'major' },
  { id: 'cawango', name: 'Cawango', x: 60, y: 62, type: 'minor' },

  // Caxito Center (User Location)
  { id: 'cine', name: 'Cine Caxito', x: 50, y: 50, type: 'major' }, 
  { id: 'estadio', name: 'Estádio Municipal do Dande', x: 40, y: 48, type: 'major' },
  { id: 'hosp-prov', name: 'Hospital Provincial', x: 55, y: 45, type: 'minor' },

  // Route to Destination
  { id: 'hosp-geral', name: 'Hospital Geral', x: 60, y: 40, type: 'minor' },
  { id: 'hosp-abel', name: 'Hospital Abel do Santos', x: 65, y: 35, type: 'minor' },
  { id: 'bukula', name: 'Centralidade do Bukula', x: 75, y: 38, type: 'major' },
  
  // Destination Area
  { id: 'sassa-p', name: 'Sassa Povoação', x: 70, y: 25, type: 'minor' },
  { id: 'sassa-c', name: 'Sassa Cária', x: 80, y: 18, type: 'minor' },
  { id: 'acucareira', name: 'Açucareira', x: 90, y: 10, type: 'major' }, // Destination
];