
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { RideOption } from '../types';
import { RIDE_OPTIONS } from '../constants';
import { VehicleSideIcon } from './VehicleSideIcon';

interface SelectionScreenProps {
  selectedRide: RideOption;
  onSelect: (ride: RideOption) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({ 
  selectedRide, 
  onSelect, 
  onBack, 
  onConfirm 
}) => {
  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#007FF0] text-white p-6 pt-12 pb-8 rounded-b-3xl shadow-lg z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-2xl font-bold">Escolha a Viagem</h1>
        <p className="text-white/80 text-sm mt-1">Caxito ➔ Açucareira</p>
      </div>

      {/* List */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {RIDE_OPTIONS.map((ride) => (
          <div 
            key={ride.id}
            onClick={() => onSelect(ride)}
            className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
              selectedRide.id === ride.id 
                ? 'border-[#007FF0] bg-[#007FF0]/5 shadow-xl scale-[1.02]' 
                : 'border-transparent bg-white shadow-sm hover:shadow-md opacity-80'
            }`}
          >
            {/* Vehicle Icon Wrapper */}
            <div className="w-20 h-14 shrink-0 flex items-center justify-center">
               <VehicleSideIcon category={ride.id} color={ride.color} className="w-full h-full" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{ride.name}</h3>
              <p className="text-xs text-gray-500">{ride.eta} • {ride.capacity} {ride.capacity === 1 ? 'lugar' : 'lugares'}</p>
            </div>
            <div className="text-right">
               <span className="block font-bold text-lg whitespace-nowrap text-[#007FF0]">Kz {ride.price.toLocaleString('pt-AO')}</span>
            </div>
            {selectedRide.id === ride.id && (
                <div className="absolute top-4 right-4">
                    <div className="w-4 h-4 bg-[#007FF0] rounded-full border-2 border-white shadow-sm"></div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 bg-white border-t border-gray-100">
        <button 
          onClick={onConfirm}
          className="w-full bg-[#007FF0] hover:bg-[#0066CC] text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
        >
          Confirmar {selectedRide.name}
        </button>
      </div>
    </div>
  );
};
