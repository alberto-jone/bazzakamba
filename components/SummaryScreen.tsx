
import React, { useState } from 'react';
import { RefreshCw, ArrowRight, Sparkles, Send, MessageSquarePlus } from 'lucide-react';
import { RideOption } from '../types';
import { analyzeFeedback } from '../services/geminiService';
import { db } from '../services/db';

interface SummaryScreenProps {
  selectedRide: RideOption;
  rating: number;
  onHome: () => void;
  onFeedbackApp?: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ selectedRide, rating, onHome, onFeedbackApp }) => {
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<{message: string, sentiment: string} | null>(null);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    
    setIsAnalyzing(true);
    
    // 1. Analyze with AI
    const result = await analyzeFeedback(feedback, rating);
    
    // 2. Save to Database (Reporting)
    db.saveDriverFeedback({
      rideRating: rating,
      comment: feedback,
      sentiment: result.sentiment
    });

    setAiResponse({
        message: result.responseMessage,
        sentiment: result.sentiment
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#007FF0] text-white p-6 pt-12 pb-6 rounded-b-3xl shadow-xl">
         <div className="flex items-center gap-2 mb-2">
             <div className="p-1 bg-white/20 rounded-md backdrop-blur-sm">
                 <ArrowRight className="w-3 h-3 text-white" />
             </div>
             <span className="font-bold text-sm">VAMU</span>
         </div>
         <h1 className="text-2xl font-bold">Resumo da Viagem</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
         {/* Receipt Card */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
             <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Valor Final</p>
                     <p className="text-3xl font-bold text-[#007FF0]">Kz {selectedRide.price.toLocaleString('pt-AO')}</p>
                 </div>
                 <div className="text-right">
                     <span className="bg-[#007FF0]/10 text-[#007FF0] text-xs font-bold px-2 py-1 rounded border border-[#007FF0]/20">
                        {selectedRide.name}
                     </span>
                 </div>
             </div>
             
             <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-[#007FF0] rounded-full"></div>
                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                        {/* Changed destination dot from Green to Red to match map pin */}
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-xs text-gray-400">Partida</p>
                            <p className="font-semibold text-gray-900">Cine Caxito</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Destino</p>
                            <p className="font-semibold text-gray-900">Açucareira</p>
                        </div>
                    </div>
                </div>
             </div>
             
             <div className="pt-2 text-xs text-gray-500 flex justify-between">
                <span>Duração: 17 mins</span>
                <span>Sua Avaliação: {rating} ★</span>
             </div>
         </div>

         {/* AI Feedback Section */}
         <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Feedback para o Motorista</h3>
                {aiResponse && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        aiResponse.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 
                        aiResponse.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {aiResponse.sentiment}
                    </span>
                )}
            </div>
            
            {!aiResponse ? (
                <div className="relative">
                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Escreva algo sobre a viagem..." 
                        className="w-full bg-white rounded-xl p-4 h-24 border border-gray-200 text-sm text-gray-900 focus:ring-2 focus:ring-[#007FF0] focus:outline-none resize-none placeholder-gray-400"
                    ></textarea>
                    <button 
                        onClick={handleSubmitFeedback}
                        disabled={isAnalyzing || !feedback}
                        className="absolute bottom-3 right-3 bg-[#007FF0] hover:bg-[#0066CC] text-white p-2 rounded-lg disabled:opacity-50 hover:scale-105 transition-transform"
                    >
                        {isAnalyzing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-gray-900 to-black text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                    <Sparkles className="w-12 h-12 text-yellow-400 absolute -top-2 -right-2 opacity-20" />
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Resposta da IA</p>
                    <p className="text-sm leading-relaxed italic">"{aiResponse.message}"</p>
                    <button 
                        onClick={() => { setAiResponse(null); setFeedback(''); }}
                        className="mt-3 text-xs text-gray-400 hover:text-white underline"
                    >
                        Escrever outro
                    </button>
                </div>
            )}
         </div>
         
         {/* PROTOTYPE FEEDBACK CTA */}
         {onFeedbackApp && (
           <button 
              onClick={onFeedbackApp}
              className="w-full py-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center gap-2 text-yellow-700 font-bold text-sm hover:bg-yellow-100 transition-colors"
           >
              <MessageSquarePlus className="w-4 h-4" /> Avaliar a Aplicação
           </button>
         )}

      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white border-t border-gray-100 space-y-3">
          <button 
             onClick={onHome}
             className="w-full bg-[#007FF0] hover:bg-[#0066CC] text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
             <RefreshCw className="w-4 h-4" /> Nova Corrida
          </button>
      </div>
    </div>
  );
};
