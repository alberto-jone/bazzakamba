
import React, { useEffect, useState } from 'react';
import { RideStatus } from '../types';
import { Plus, Minus } from 'lucide-react';

interface MapBackgroundProps {
  showRoute?: boolean;
  userLocation?: boolean;
  rideStatus?: RideStatus | 'home';
  vehicleType?: string;
  vehicleColor?: string;
}

export const MapBackground: React.FC<MapBackgroundProps> = ({ 
  showRoute, 
  userLocation, 
  rideStatus = 'home',
  vehicleType = 'car',
  vehicleColor = '#007FF0'
}) => {
  
  // --- ORGANIC PATH DEFINITIONS (Bezier Curves) ---
  // Coordinate system: 400x800
  
  // 1. River (Natural curve on the left)
  const riverPath = "M -50 800 C 50 600, 20 400, 80 200 S 150 0, 120 -50 L -50 -50 Z";

  // 2. Pickup Route (Panguila -> Cine Caxito)
  // Starts bottom-left, curves around the river, heads to center
  const pickupPathData = "M 80 820 C 90 700, 180 650, 160 550 S 140 450, 200 400";
  
  // 3. Trip Route (Cine Caxito -> Açucareira)
  // Starts center, heads up-right through the city, then straightens out to destination
  const tripPathData = "M 200 400 C 260 350, 240 250, 280 150 S 380 80, 350 50";

  // 4. Secondary Roads (Connecting neighborhood streets)
  const secondaryRoads = [
    // Left side connections
    "M 20 600 C 60 610, 100 600, 130 580",
    "M 40 500 C 80 510, 100 480, 150 470",
    // Center intersections
    "M 180 550 L 300 580", 
    "M 200 400 L 350 420", // Main crossroad at pickup
    "M 150 350 L 50 320",
    // Top area network
    "M 220 280 L 380 300",
    "M 260 200 L 400 180",
    "M 280 150 L 150 120",
    // Vertical connectors
    "M 300 600 C 290 400, 320 300, 350 100",
    "M 100 350 C 110 250, 90 150, 120 50"
  ];

  // 5. Green Zones (Parks/Fields)
  const parks = [
    "M 220 420 L 320 440 L 310 550 L 200 520 Z", // Park near pickup
    "M 50 200 C 80 200, 100 100, 50 50 L 0 50 L 0 200 Z", // Top left park
    "M 300 250 C 350 250, 380 150, 320 100 L 280 120 Z" // Top right park
  ];

  // --- CAMERA LOGIC (Dynamic ViewBox) ---
  const [baseViewBox, setBaseViewBox] = useState({ x: 0, y: 0, w: 400, h: 800 });
  const [userZoom, setUserZoom] = useState(1); 

  useEffect(() => {
    switch (rideStatus) {
      case 'home':
        setBaseViewBox({ x: 0, y: 100, w: 400, h: 700 });
        break;
      case 'searching':
        setBaseViewBox({ x: 0, y: 200, w: 400, h: 600 }); 
        break;
      case 'pickup':
        setBaseViewBox({ x: 50, y: 350, w: 250, h: 400 }); // Zoom on approach
        break;
      case 'arrived':
        setBaseViewBox({ x: 100, y: 300, w: 200, h: 200 }); // Close up on user
        break;
      case 'traveling':
        setBaseViewBox({ x: 100, y: 50, w: 300, h: 450 }); // Follow trip
        break;
      case 'completed':
        setBaseViewBox({ x: 250, y: 0, w: 150, h: 150 }); // Destination focus
        break;
      default:
        setBaseViewBox({ x: 0, y: 0, w: 400, h: 800 });
    }
    setUserZoom(1); 
  }, [rideStatus]);

  const finalViewBox = `${baseViewBox.x - (baseViewBox.w * (userZoom - 1)) / 2} ${baseViewBox.y - (baseViewBox.h * (userZoom - 1)) / 2} ${baseViewBox.w * userZoom} ${baseViewBox.h * userZoom}`;

  const isPickingUp = rideStatus === 'searching' || rideStatus === 'pickup' || rideStatus === 'arrived';
  const isTraveling = rideStatus === 'traveling' || rideStatus === 'completed';

  const handleZoomIn = () => setUserZoom(prev => Math.max(0.4, prev - 0.2));
  const handleZoomOut = () => setUserZoom(prev => Math.min(2.5, prev + 0.2));

  return (
    <div className="absolute inset-0 z-0 bg-[#E5E7EB] overflow-hidden font-sans group select-none">
      <style>{`
        .map-transition {
          transition: viewBox 1.5s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        
        @keyframes followPickupPath {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }

        @keyframes followTripPath {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }

        .vehicle-pickup {
          offset-path: path("${pickupPathData}");
          animation: followPickupPath 10s linear forwards;
          offset-rotate: auto 0deg;
        }

        .vehicle-trip {
          offset-path: path("${tripPathData}");
          animation: followTripPath 14s linear forwards;
          offset-rotate: auto 0deg;
        }

        .pulse-ring {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* ZOOM CONTROLS */}
      <div className="absolute right-4 top-32 z-50 flex flex-col gap-2 shadow-xl">
        <button 
          onClick={handleZoomIn}
          title="Zoom in"
          className="bg-white p-3 rounded-t-lg hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-b border-gray-200"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button 
          onClick={handleZoomOut}
          title="Zoom out"
          className="bg-white p-3 rounded-b-lg hover:bg-gray-50 active:bg-gray-100 text-gray-700"
        >
          <Minus className="w-6 h-6" />
        </button>
      </div>

      {/* MAP SVG LAYER */}
      <svg 
        className="w-full h-full absolute inset-0 map-transition" 
        viewBox={finalViewBox}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* --- BASE LAND --- */}
        <rect x="-200" y="-200" width="1200" height="1600" fill="#F3F4F6" />

        {/* --- WATER / RIVER --- */}
        <path d={riverPath} fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2" />

        {/* --- GREEN ZONES / PARKS --- */}
        {parks.map((d, i) => (
            <path key={i} d={d} fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
        ))}

        {/* --- SECONDARY ROADS --- */}
        <g stroke="white" strokeWidth="12" fill="none" strokeLinecap="round">
           {secondaryRoads.map((d, i) => <path key={i} d={d} />)}
        </g>
        {/* Inner stroke for secondary roads to give depth */}
        <g stroke="#E5E7EB" strokeWidth="10" fill="none" strokeLinecap="round">
           {secondaryRoads.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* --- MAIN ARTERIAL ROADS (Base) --- */}
        <path d={pickupPathData} stroke="#FFFFFF" strokeWidth="24" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={tripPathData} stroke="#FFFFFF" strokeWidth="24" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Road Borders */}
        <path d={pickupPathData} stroke="#D1D5DB" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents: 'none'}} opacity="0.3" />
        <path d={tripPathData} stroke="#D1D5DB" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents: 'none'}} opacity="0.3" />

        {/* --- ACTIVE ROUTE --- */}
        {rideStatus === 'pickup' && (
           <path d={pickupPathData} stroke="black" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        )}
        {rideStatus === 'traveling' && (
           <path d={tripPathData} stroke="black" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        )}

        {/* --- BUILDINGS / BLOCKS (To add density) --- */}
        <g fill="#E5E7EB" opacity="0.8">
           <rect x="230" y="420" width="40" height="40" rx="4" />
           <rect x="280" y="410" width="50" height="60" rx="4" />
           <rect x="160" y="460" width="30" height="30" rx="4" />
           <rect x="210" y="300" width="40" height="80" rx="4" />
           <rect x="260" y="320" width="60" height="40" rx="4" />
           <circle cx="200" cy="400" r="60" fill="none" stroke="#E5E7EB" strokeWidth="2" opacity="0.5" />
        </g>

        {/* --- PINS --- */}
        
        {/* Pickup Pin (User) - Usando #007FF0 */}
        {(userLocation && isPickingUp) && (
          <g transform="translate(200, 400)">
             <circle r="30" fill="#007FF0" className="pulse-ring opacity-30" />
             <circle r="12" fill="#007FF0" stroke="white" strokeWidth="3" />
             {/* Floating Label */}
             <g transform="translate(0, -35)">
                <rect x="-35" y="-20" width="70" height="20" rx="4" fill="white" stroke="#E5E7EB" />
                <text x="0" y="-5" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Embarque</text>
                <path d="M -5 0 L 0 5 L 5 0 Z" fill="white" transform="translate(0,0)" />
             </g>
          </g>
        )}

        {/* Destination Pin */}
        {isTraveling && (
          <g transform="translate(350, 50)">
             <circle r="30" fill="#EF4444" className="pulse-ring opacity-30" />
             <path d="M 0 0 L 0 -35" stroke="black" strokeWidth="2" />
             <path d="M 0 -35 Q 15 -45 0 -55" fill="#EF4444" stroke="#EF4444" strokeWidth="2" />
             <circle r="4" cx="0" cy="0" fill="black" />
             
             {/* Floating Label */}
             <g transform="translate(0, -65)">
                <rect x="-35" y="-20" width="70" height="20" rx="4" fill="white" stroke="#E5E7EB" />
                <text x="0" y="-5" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold">Destino</text>
             </g>
          </g>
        )}

        {/* --- VEHICLES --- */}
        {rideStatus === 'pickup' && (
          <g className="vehicle-pickup">
            <g transform="rotate(90)">
               <VehicleIcon type={vehicleType} color={vehicleColor} />
            </g>
          </g>
        )}

        {rideStatus === 'arrived' && (
           <g transform="translate(200, 400) rotate(45)">
                <VehicleIcon type={vehicleType} color={vehicleColor} />
           </g>
        )}

        {rideStatus === 'traveling' && (
          <g className="vehicle-trip">
              <g transform="rotate(90)">
                <VehicleIcon type={vehicleType} color={vehicleColor} />
              </g>
          </g>
        )}

        {rideStatus === 'completed' && (
           <g transform="translate(350, 50) rotate(0)">
                <VehicleIcon type={vehicleType} color={vehicleColor} />
           </g>
        )}

      </svg>
    </div>
  );
};

// Detailed Vehicle Icon
const VehicleIcon = ({ type, color }: { type: string, color: string }) => {
  const isMoto = type === 'moto';
  
  return (
    <g transform={isMoto ? "scale(0.7)" : "scale(0.9)"}>
      {/* Dropshadow */}
      <ellipse cx="0" cy="4" rx={isMoto ? 8 : 14} ry={isMoto ? 18 : 24} fill="black" opacity="0.2" filter="blur(2px)" />
      
      {/* Chassis */}
      <rect x={isMoto ? -8 : -12} y="-20" width={isMoto ? 16 : 24} height="40" rx={isMoto ? 3 : 6} fill={color} stroke="white" strokeWidth="1.5" />
      
      {/* Windshield / Roof (Car) */}
      {!isMoto && (
        <>
            <path d="M -10 -12 L 10 -12 L 10 2 L -10 2 Z" fill="#111827" opacity="0.9" /> {/* Front Glass */}
            <path d="M -10 24 L 10 24 L 10 14 L -10 14 Z" fill="#111827" opacity="0.8" /> {/* Rear Glass */}
            <rect x="-11" y="2" width="22" height="12" fill={color} opacity="0.9" /> {/* Roof */}
        </>
      )}

      {/* Moto details */}
      {isMoto && (
          <>
            <rect x="-4" y="-15" width="8" height="10" fill="#111827" rx="2" /> {/* Seat */}
            <circle cx="0" cy="10" r="5" fill="#111827" /> {/* Helmet/Rider */}
            <rect x="-10" y="-18" width="20" height="2" fill="black" /> {/* Handlebars */}
          </>
      )}
      
      {/* Lights */}
      <path d="M -10 -21 L -6 -21 L -6 -19 L -10 -19 Z" fill="#FEF08A" />
      <path d="M 6 -21 L 10 -21 L 10 -19 L 6 -19 Z" fill="#FEF08A" />
      
      <path d="M -10 21 L -6 21 L -6 19 L -10 19 Z" fill="#EF4444" />
      <path d="M 6 21 L 10 21 L 10 19 L 6 19 Z" fill="#EF4444" />

    </g>
  );
};
