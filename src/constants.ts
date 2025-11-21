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
    name: 'Económico',
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
    color: '#E63121' // Orange
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
  name: 'Paulo Silva',
  rating: 4.9,
  carModel: 'Toyota Corolla',
  carColor: 'Azul',
  plate: 'LD-22-44-GX',
  trips: 1240,
  image: '/motorista.jpg'
};

// Simplified coordinate map for the Dande/Caxito/Panguila axis
export const LANDMARKS: Landmark[] = [
  // Área Central (Início/Origem do Motorista)
  { id: 'maxi-maianga', name: 'Maxi da Maianga', x: 10, y: 95, type: 'major' },
  { id: 'prenda', name: 'Prenda', x: 25, y: 92, type: 'minor' },
  
  // Rota Urbana e Aeroporto
  { id: 'aeroporto', name: 'Aeroporto 4 de Fevereiro', x: 35, y: 85, type: 'major' },
  { id: 'cassenda', name: 'Bairro Cassenda', x: 40, y: 78, type: 'minor' },
  { id: 'rocha-calcadao', name: 'Calçadão do Rocha', x: 50, y: 70, type: 'minor' },
  { id: 'rocha-padaria', name: 'Rocha Padaria', x: 55, y: 65, type: 'minor' },

  // Transição Sul (Gamek e Clínica)
  { id: 'gamek', name: 'Gamek', x: 60, y: 55, type: 'major' }, 
  { id: 'multiperfil', name: 'Clinica Multiperfil', x: 65, y: 48, type: 'major' },
  { id: 'bomba-mirantes', name: 'Bomba dos Mirantes', x: 70, y: 42, type: 'minor' },
  
  // Rota do Futungo
  { id: 'pedonal-futungo', name: 'Pedonal do Futungo', x: 75, y: 35, type: 'minor' },
  { id: 'angomart-futungo', name: 'AngoMart Futungo', x: 80, y: 25, type: 'major' },
  
  // Área Final/Destino
  { id: 'benfica', name: 'Benfica', x: 90, y: 10, type: 'major' }, // Destino
];