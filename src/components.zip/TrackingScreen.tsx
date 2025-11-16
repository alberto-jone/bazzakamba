import React, { useEffect, useState, useRef } from 'react';
import { Phone, ShieldAlert, Navigation, MessageCircle, X, Send, ChevronUp, Star } from 'lucide-react';
import { RideOption, RideStatus, ChatMessage } from '../types';
import { MOCK_DRIVER } from '../constants';
import { MapBackground } from './MapBackground';
import { db } from '../services/db';

interface TrackingScreenProps {
  selectedRide: RideOption;
  onCancel: () => void;
  onComplete: () => void;
}

export const TrackingScreen: React.FC<TrackingScreenProps> = ({ selectedRide, onCancel, onComplete }) => {
  const [status, setStatus] = useState<RideStatus>('searching');
  const [timeDisplay, setTimeDisplay] = useState('Procurando...');
  const [infoText, setInfoText] = useState('Localizando motoristas próximos...');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const isMountedRef = useRef(true);
  
  const [driverData, setDriverData] = useState<any>(MOCK_DRIVER);

  // Carregar motorista aleatorio
  useEffect(() => {
    const randomDriver = db.getRandomDriver();
    setDriverData({
        ...MOCK_DRIVER,
        name: randomDriver.name,
        plate: randomDriver.plate || MOCK_DRIVER.plate
    });
  }, []);

  const handleCall = () => {
    window.location.href = 'tel:945722663';
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');
    setTimeout(() => {
      if(isMountedRef.current) {
        const driverMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "Olá! Estou a caminho. Chego em breve.",
          sender: 'driver',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, driverMsg]);
      }
    }, 2500);
  };

  useEffect(() => {
    isMountedRef.current = true;
    const runSimulation = async () => {
      if (isMountedRef.current) {
        setStatus('searching');
        setTimeDisplay('Procurando...');
        setInfoText('Contactando motoristas na zona...');
      }
      await new Promise(r => setTimeout(r, 2000));
      if (!isMountedRef.current) return;

      setStatus('pickup');
      setTimeDisplay('Motorista a caminho');
      setInfoText('Chegada em 2 min');
      
      await new Promise(r => setTimeout(r, 10000)); 
      if (!isMountedRef.current) return;

      setStatus('arrived');
      setTimeDisplay('Motorista chegou');
      setInfoText(`${driverData.name.split(' ')[0]} está à sua espera`);
      
      await new Promise(r => setTimeout(r, 5000));
      if (!isMountedRef.current) return;

      setStatus('traveling');
      setTimeDisplay('Em viagem');
      setInfoText('Destino: Açucareira'); 
      
      await new Promise(r => setTimeout(r, 14000)); 
      if (!isMountedRef.current) return;

      setStatus('completed');
      await new Promise(r => setTimeout(r, 1500)); 
      if (isMountedRef.current) onComplete();
    };
    runSimulation();
    return () => { isMountedRef.current = false; };
  }, [onComplete]);

  const getProgressWidth = () => {
    switch(status) {
      case 'searching': return '10%';
      case 'pickup': return '35%';
      case 'arrived': return '50%';
      case 'traveling': return '85%';
      default: return '100%';
    }
  };

  // Dynamic header text color based on background brightness
  const headerTextColor = selectedRide.id === 'moto' ? 'text-black' : 'text-white';

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden">
      <div className="flex-1 relative">
         <MapBackground userLocation rideStatus={status} vehicleType={selectedRide.type} vehicleColor={selectedRide.color} />
         {status !== 'searching' && !isChatOpen && (
           <button onClick={() => setIsChatOpen(true)} className="absolute bottom-6 right-4 bg-white text-[#007FF0] p-3 rounded-full shadow-xl border border-gray-100 flex items-center gap-2 z-30 hover:bg-gray-50 active:scale-95 transition-all">
              <MessageCircle className="w-6 h-6" />
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full absolute -top-1 -right-1">1</span>
           </button>
         )}
         {status === 'traveling' && (
           <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg z-10 flex flex-col gap-1 border border-gray-200 max-w-[140px] animate-in slide-in-from-right-5">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Destino</span>
              <span className="font-bold text-gray-900 text-sm leading-tight">Açucareira, Caxito</span>
           </div>
         )}
      </div>

      <div className="bg-white z-20 rounded-t-3xl shadow-[0_-5px_40px_-10px_rgba(0,0,0,0.2)] relative flex flex-col">
         <div className={`p-4 rounded-t-3xl flex items-center justify-between transition-colors duration-500 shadow-md ${headerTextColor}`} style={{ backgroundColor: status === 'arrived' ? '#22C55E' : selectedRide.color }}>
            <div className="flex items-center gap-3">
                {status === 'searching' ? (
                  <div className={`w-5 h-5 border-2 rounded-full animate-spin ${selectedRide.id === 'moto' ? 'border-black/30 border-t-black' : 'border-white/30 border-t-white'}`}></div>
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
                <div>
                   <div className="font-bold text-base leading-tight">{timeDisplay}</div>
                   <div className="text-xs opacity-90">{infoText}</div>
                </div>
            </div>
            {status === 'traveling' && <div className="font-bold text-sm">12:55</div>}
         </div>

         <div className="h-1 bg-gray-100 w-full">
            <div className="h-full transition-all duration-[2000ms] ease-linear" style={{ width: getProgressWidth(), backgroundColor: status === 'arrived' ? '#22C55E' : selectedRide.color }}></div>
         </div>

         <div className="p-5 pb-8 space-y-5">
            {status === 'searching' ? (
            <div className="space-y-4 animate-pulse">
                <div className="h-14 bg-gray-100 rounded-xl w-full"></div>
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-100 rounded w-20"></div>
                </div>
            </div>
            ) : (
            <div className="space-y-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={driverData.image} alt="Driver" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">{driverData.name}</h3>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 border border-yellow-100">
                                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" />
                                  <span className="font-bold text-xs">{driverData.rating}</span>
                                </div>
                                <span className="text-xs">• {driverData.trips} viagens</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-right shadow-sm">
                             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{driverData.carModel}</div>
                             <div className="font-mono font-bold text-gray-900 text-sm">{driverData.plate}</div>
                        </div>
                        <span className="text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: selectedRide.color + '1A', color: selectedRide.color }}>{driverData.carColor}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleCall} className="flex items-center justify-center gap-2 bg-[#007FF0]/10 hover:bg-[#007FF0]/20 text-[#007FF0] py-3.5 rounded-xl font-bold transition-all border border-[#007FF0]/20 active:scale-[0.98]">
                        <Phone className="w-5 h-5 fill-current" />
                        Ligar
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold transition-all border border-gray-200 active:scale-[0.98]">
                         <ShieldAlert className="w-5 h-5" />
                         Segurança
                    </button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Pagamento</div>
                        <div className="text-xl font-bold" style={{ color: selectedRide.color }}>Kz {selectedRide.price.toLocaleString('pt-AO')}</div>
                    </div>
                    <button onClick={onCancel} className="text-red-500 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-lg transition-colors">Cancelar</button>
                </div>
            </div>
            )}
         </div>
      </div>

      {isChatOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
           <div className="bg-[#007FF0] text-white p-4 pt-12 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                 <img src={driverData.image} className="w-8 h-8 rounded-full border border-white/20" />
                 <div>
                    <div className="font-bold text-sm">{driverData.name}</div>
                    <div className="text-[10px] text-green-300 flex items-center gap-1 font-bold">
                       <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div> Online
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                 <ChevronUp className="w-5 h-5 rotate-180" />
              </button>
           </div>
           <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && <div className="text-center text-xs text-gray-400 mt-10">Envie uma mensagem para o motorista...</div>}
              {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-[#007FF0] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                       {msg.text}
                       <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/90' : 'text-gray-400'}`}>{msg.time}</div>
                    </div>
                 </div>
              ))}
           </div>
           <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2 pb-6">
              <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Escrever mensagem..." className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007FF0]" onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="p-3 bg-[#007FF0] text-white rounded-full disabled:opacity-50 hover:bg-[#0066CC] transition-colors shadow-sm"><Send className="w-4 h-4" /></button>
           </div>
        </div>
      )}
    </div>
  );
};