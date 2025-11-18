
import React, { useState } from 'react';
import { MapPin, X, Menu, LayoutDashboard, FileDown, MessageSquare, LogOut, UserCircle, ShieldCheck, Car } from 'lucide-react';
import { MapBackground } from './MapBackground';
import { RIDE_OPTIONS, LANDMARKS } from '../constants';
import { RideOption, ViewState } from '../types';
import { VehicleSideIcon } from './VehicleSideIcon';
import { db } from '../services/db';

interface HomeScreenProps {
  onNext: () => void;
  selectedRide: RideOption;
  onSelectRide: (ride: RideOption) => void;
  onNavigateTo: (view: ViewState) => void;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNext, 
  selectedRide, 
  onSelectRide,
  onNavigateTo,
  onLogout
}) => {
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isValidSelection, setIsValidSelection] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get User Role & Check Permissions
  const user = db.getLoggedInUser();
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';
  const hasDashboardAccess = isAdmin || isDriver; // Apenas estes podem ver o dashboard

  const handleSearch = (text: string) => {
    setDestination(text);
    setIsValidSelection(false);
    
    if (text.length > 1) {
      const matches = LANDMARKS.filter(l => 
        l.name.toLowerCase().includes(text.toLowerCase())
      ).map(l => l.name);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setDestination(name);
    setIsValidSelection(true);
    setShowSuggestions(false);
  };

  const handleExportReport = () => {
    db.exportDataToCSV();
    setIsMenuOpen(false);
  };

  return (
    <div className="h-full w-full relative flex flex-col">
      <MapBackground userLocation rideStatus="home" />
      
      {/* MENU OVERLAY */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 animate-in fade-in backdrop-blur-sm">
          <div 
            className="h-full w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header - Usando #007FF0 para não-admins */}
            <div className={`${isAdmin ? 'bg-gray-900' : 'bg-[#007FF0]'} p-6 pt-12 text-white transition-colors`}>
              <div className="flex justify-between items-center mb-6">
                 <div className="font-bold text-xl">Bazza Kamba</div>
                 <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Fechar menu">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                    {isAdmin ? <ShieldCheck className="w-6 h-6 text-white" /> : isDriver ? <Car className="w-6 h-6 text-white" /> : <UserCircle className="w-6 h-6 text-white" />}
                 </div>
                 <div>
                   <div className="text-base font-bold leading-tight">{user?.name || 'Visitante'}</div>
                   <div className="text-[10px] opacity-80 uppercase tracking-wider font-medium mt-1">
                     {isAdmin ? 'Administrador' : isDriver ? 'Motorista' : 'Passageiro'}
                   </div>
                 </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
               
               {/* DASHBOARD - CONDITIONAL RENDER */}
               {hasDashboardAccess && (
                 <div className="pb-2 border-b border-gray-100 mb-2">
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Gestão</div>
                   <button 
                     onClick={() => onNavigateTo('admin')}
                     className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#007FF0]/10 text-gray-900 font-bold transition-colors border border-gray-200 hover:border-[#007FF0]/30 group"
                   >
                     <LayoutDashboard className="w-5 h-5 text-gray-500 group-hover:text-[#007FF0]" />
                     Dashboard {isDriver ? '(Motorista)' : '(Admin)'}
                   </button>
                 </div>
               )}

               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-2">Opções</div>

               {isAdmin && (
                <button 
                  onClick={handleExportReport}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <FileDown className="w-5 h-5 text-gray-600" />
                  Exportar Relatório CSV
                </button>
               )}

               <button 
                 onClick={() => onNavigateTo('prototype_feedback')}
                 className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                 <MessageSquare className="w-5 h-5 text-yellow-500" />
                 Avaliar Protótipo
               </button>
            </div>

            {/* Menu Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
               <button 
                 onClick={onLogout}
                 className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:bg-red-50 hover:border-red-100 text-red-600 font-medium transition-colors shadow-sm"
               >
                 <LogOut className="w-5 h-5" />
                 Sair da Conta
               </button>
               <div className="text-center mt-4 text-[10px] text-gray-400 font-medium">
                  Bazza Kamba v1.1.0 (RBAC)
               </div>
            </div>
          </div>
          {/* Close area */}
          <div className="flex-1 h-full" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      {/* Top Overlay - Location Input */}
      <div className="absolute top-14 left-4 right-4 z-20 flex flex-col gap-2">
        
        {/* MENU BUTTON */}
        <button 
           onClick={() => setIsMenuOpen(true)}
           className="absolute -top-10 left-0 p-2.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-transform active:scale-95 border border-gray-100"
        >
           <Menu className="w-6 h-6 text-gray-900" />
           {hasDashboardAccess && (
             <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
           )}
        </button>

        {/* Current Location (Fixed) */}
        <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-3 border border-gray-200">
          {/* Substituindo bg-blue-500 e ring-blue-100 */}
          <div className="w-2 h-2 bg-[#007FF0] rounded-full ml-1 ring-4 ring-[#007FF0]/20"></div>
          <div className="flex-1">
            <form action="">
              <label htmlFor="LocalAtual" className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Local Atual</label>
              <input
                type="text"
                name="localAtual"
                id="LocalAtual"
                title="Local Atual"
                placeholder="Cine Caxito"
                aria-label="Local Atual"
                className="w-full text-sm text-gray-900 bg-transparent outline-none"
              />
            </form>
            {/* <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Local Atual</div>
            <div className="font-semibold text-sm text-gray-900">Cine Caxito</div> */}
          </div>
        </div>

        {/* Destination Input - Black Background / White Text */}
        <div className="bg-gray-900 p-3 rounded-lg shadow-xl flex items-center gap-3 relative border border-gray-800 transition-all focus-within:ring-2 focus-within:ring-[#007FF0]">
          <div className="w-2 h-2 bg-white rounded-full ml-1"></div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Para onde vamos?</div>
            <input 
              type="text" 
              value={destination}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Digite o destino (ex: Açucareira)"
              className="w-full font-bold text-sm text-white placeholder-gray-500 bg-transparent outline-none"
            />
          </div>
          {destination && (
            <button onClick={() => { setDestination(''); setIsValidSelection(false); }} className="p-1" title="Limpar destino">
               <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 mt-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {suggestions.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => selectSuggestion(item)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-none flex items-center gap-2 font-medium"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet - Ride Selector */}
      <div className="mt-auto z-10 bg-white rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] p-5 pb-8 space-y-4">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2"></div>
        
        {/* Ride Options Grid - Interactive & Colorful */}
        <div className="grid grid-cols-4 gap-2">
             {RIDE_OPTIONS.map(ride => {
                 const isSelected = selectedRide.id === ride.id;
                 return (
                   <button 
                      key={ride.id} 
                      onClick={() => onSelectRide(ride)}
                      // Substituindo bg-blue-50
                      className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
                        isSelected ? 'bg-[#007FF0]/10 scale-105 shadow-sm ring-1 ring-[#007FF0]' : 'hover:bg-gray-50 opacity-70 hover:opacity-100'
                      }`}
                   >
                      <div className={`w-14 h-10 flex items-center justify-center transition-all`}>
                          <VehicleSideIcon category={ride.id} color={ride.color} />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                            {ride.name.split(' ')[0]}
                        </span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-[#007FF0]' : 'text-gray-400'}`}>
                            Kz {ride.price}
                        </span>
                      </div>
                   </button>
                 )
             })}
        </div>

        <button 
          onClick={onNext}
          disabled={!isValidSelection}
          className={`w-full font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all text-white text-lg flex items-center justify-center gap-2 ${
            isValidSelection ? 'bg-[#007FF0] hover:bg-[#0066CC]' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isValidSelection ? (
            <>Solicitar {selectedRide.name}</>
          ) : (
            'Selecione um Destino'
          )}
        </button>
      </div>
    </div>
  );
};
