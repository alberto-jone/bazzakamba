
import React, { useState } from 'react';
import { Star, CheckCircle, Home } from 'lucide-react';
import { db } from '../services/db';

export const PrototypeFeedbackScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    db.savePrototypeFeedback({ rating, comment });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-full w-full bg-white flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in">
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-gray-900">Obrigado!</h2>
            <p className="text-gray-500 mt-2">Sua opinião ajuda a melhorar o vamu.</p>
         </div>
         <button 
            onClick={onFinish}
            className="w-full bg-[#E63121] text-white font-bold py-4 rounded-xl shadow-lg mt-8"
         >
            Voltar ao Início
         </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="bg-[#E63121] p-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
         <h1 className="text-white text-xl font-bold text-center">Avalie o Aplicativo</h1>
         <p className="text-white/80 text-center text-sm mt-1">O que achou desta simulação?</p>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center space-y-8">
         <div className="flex gap-2">
             {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} title={`Rate ${star} stars`} className="hover:scale-110 transition-transform">
                   <Star className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
             ))}
         </div>

         <div className="w-full">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Comentários / Sugestões</label>
            <textarea 
               className="w-full h-32 bg-gray-50 rounded-xl p-4 text-gray-900 text-sm border border-gray-200 focus:border-[#E63121] outline-none resize-none"
               placeholder="O design está bom? A velocidade?"
               value={comment}
               onChange={(e) => setComment(e.target.value)}
            ></textarea>
         </div>

         <button 
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${
               rating > 0 ? 'bg-[#E63121] text-white hover:bg-[#0066CC]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
         >
            Enviar Avaliação
         </button>
         
         <button onClick={onFinish} className="text-gray-400 text-sm font-bold hover:text-gray-600">
            Cancelar
         </button>
      </div>
    </div>
  );
};
