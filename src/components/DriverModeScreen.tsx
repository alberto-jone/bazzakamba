
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Navigation, Phone, X, CheckCircle, MapPin } from 'lucide-react';
import { MapBackground } from './MapBackground';

interface DriverModeScreenProps {
  onExit: () => void;
}

type DriverState = 'idle' | 'request_received' | 'pickup' | 'arrived' | 'traveling' | 'completed';

export const DriverModeScreen: React.FC<DriverModeScreenProps> = ({ onExit }) => {
  const [status, setStatus] = useState<DriverState>('idle');
  const [timeLeft, setTimeLeft] = useState(10); // Tempo para aceitar

  // Simulação de pedido de corrida
  useEffect(() => {
    let timer: any;
    if (status === 'idle') {
      // Após 3 segundos online, recebe uma corrida
      timer = setTimeout(() => {
        setStatus('request_received');
        setTimeLeft(15);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  // Contador Regressivo para aceitar
  useEffect(() => {
    let interval: any;
    if (status === 'request_received' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (status === 'request_received' && timeLeft === 0) {
      setStatus('idle'); // Expirou, volta a buscar
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  const handleAccept = () => setStatus('pickup');
  const handleDecline = () => setStatus('idle');
  
  // Cancelar (Antes do passageiro entrar)
  const handleCancel = () => {
    const confirm = window.confirm("Tem certeza que deseja cancelar a corrida?");
    if(confirm) setStatus('idle');
  };

  const handleArrived = () => setStatus('arrived');
  const handleStartTrip = () => setStatus('traveling');
  
  const handleComplete = () => {
    setStatus('completed');
    setTimeout(() => setStatus('idle'), 3000); // Volta a buscar após 3s
  };

  // Mapping Driver Status to Map Props
  const getMapRideStatus = () => {
    switch(status) {
      case 'pickup': return 'pickup';
      case 'arrived': return 'arrived';
      case 'traveling': return 'traveling';
      case 'completed': return 'completed';
      default: return 'home';
    }
  };

  return (
    <div className="h-full w-full relative bg-gray-900 flex flex-col">
      
      {/* HEADER - STATUS */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-14 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto">
            <button onClick={onExit} className="bg-white p-2 rounded-full shadow-md" title="Exit driver mode">
                <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <div className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wider ${
                status === 'idle' ? 'bg-[#E63121] text-white animate-pulse' : 
                status === 'request_received' ? 'bg-yellow-500 text-black animate-bounce' :
                'bg-green-500 text-white'
            }`}>
                {status === 'idle' && 'Procurando Corridas...'}
                {status === 'request_received' && 'Nova Solicitação!'}
                {status === 'pickup' && 'A Caminho'}
                {status === 'arrived' && 'Aguardando Passageiro'}
                {status === 'traveling' && 'Em Rota'}
                {status === 'completed' && 'Finalizado'}
            </div>
        </div>
      </div>

      {/* MAPA */}
      <div className="flex-1 relative bg-gray-200">
         {/* 
            Nota: Reutilizamos MapBackground. 
            userLocation={true} mostra o pino do "Passageiro" (que é o alvo do motorista).
         */}
         <MapBackground 
            userLocation={status !== 'idle'} 
            rideStatus={getMapRideStatus()}
            vehicleColor="#E63121" // O carro do motorista é azul
            vehicleType="car"
         />
      </div>

      {/* OVERLAYS DE AÇÃO */}

      {/* 1. SOLICITAÇÃO RECEBIDA */}
      {status === 'request_received' && (
         <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-[0_-10px_50px_rgba(0,0,0,0.3)] z-50 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#E63121]">Kz 3.500</h2>
                    <p className="text-sm text-gray-500">Standard Ride • 2.5 km</p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-lg font-bold text-gray-700">
                    {timeLeft}s
                </div>
            </div>
            
            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#E63121] rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800">Cine Caxito (3 min)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800">Açucareira</span>
                </div>
            </div>

            <div className="flex gap-3 h-14">
                <button onClick={handleDecline} className="flex-1 bg-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-300">
                    Recusar
                </button>
                <button onClick={handleAccept} className="flex-[2] bg-[#E63121] rounded-xl font-bold text-white hover:bg-[#0066CC] shadow-lg animate-pulse">
                    Aceitar Corrida
                </button>
            </div>
         </div>
      )}

      {/* 2. A CAMINHO (PICKUP) */}
      {(status === 'pickup' || status === 'arrived') && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 shadow-[0_-10px_50px_rgba(0,0,0,0.3)] z-50">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                       <User className="w-6 h-6 text-gray-500" />
                   </div>
                   <div>
                       <h3 className="font-bold text-gray-900">João Paulo</h3>
                       <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">★ 4.8</div>
                   </div>
                </div>
                <button className="bg-green-100 p-3 rounded-full text-green-600 hover:bg-green-200" title="Call passenger">
                    <Phone className="w-5 h-5" />
                </button>
            </div>

            {status === 'pickup' ? (
                <div className="space-y-3">
                    <div className="bg-[#E63121]/10 text-[#E63121] p-3 rounded-xl flex items-center gap-3">
                        <Navigation className="w-5 h-5" />
                        <span className="text-sm font-bold">Siga para o ponto de embarque</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleCancel} className="flex-1 py-3 text-red-500 font-bold text-sm bg-red-50 rounded-xl">
                            Cancelar
                        </button>
                        <button onClick={handleArrived} className="flex-[2] bg-[#E63121] text-white font-bold py-3 rounded-xl shadow-lg">
                            Cheguei
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                     <div className="bg-green-100 text-green-700 p-3 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-bold">Você chegou. Aguarde o passageiro.</span>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={handleCancel} className="flex-1 py-3 text-red-500 font-bold text-sm bg-red-50 rounded-xl">
                            Cancelar
                        </button>
                        <button onClick={handleStartTrip} className="flex-[2] bg-[#E63121] text-white font-bold py-3 rounded-xl shadow-lg animate-pulse">
                            Iniciar Viagem
                        </button>
                    </div>
                </div>
            )}
          </div>
      )}

      {/* 3. EM VIAGEM */}
      {status === 'traveling' && (
           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-[0_-10px_50px_rgba(0,0,0,0.3)] z-50">
               <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-500 rounded-lg">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Destino Final</div>
                            <div className="font-bold text-lg leading-tight">Açucareira</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono font-bold text-2xl">14:32</div>
                        <div className="text-xs text-gray-400">ETA</div>
                    </div>
               </div>
               <button onClick={handleComplete} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg">
                   Finalizar Corrida
               </button>
           </div>
      )}

      {/* 4. CONCLUÍDO */}
      {status === 'completed' && (
           <div className="absolute inset-0 z-50 bg-[#E63121] flex flex-col items-center justify-center text-white animate-in fade-in">
               <CheckCircle className="w-24 h-24 mb-6 text-white" />
               <h2 className="text-3xl font-bold">Viagem Finalizada!</h2>
               <p className="text-xl mt-2 opacity-90">+ Kz 3.500</p>
           </div>
      )}

    </div>
  );
};
