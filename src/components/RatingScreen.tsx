
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingScreenProps {
  rating: number;
  setRating: (r: number) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export const RatingScreen: React.FC<RatingScreenProps> = ({ rating, setRating, onSubmit, onSkip }) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  return (
    <div className="h-full w-full flex flex-col bg-white">
       <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          <div className="text-center space-y-2">
             <h2 className="text-2xl font-bold text-gray-900">Avalie a Viagem</h2>
             <p className="text-gray-500 text-sm">Como foi a viagem com o Paulo?</p>
          </div>

          {/* Star Interactive */}
          <div className="flex gap-3">
             {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  title={`Classificar com ${star} estrela${star !== 1 ? 's' : ''}`}
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`w-10 h-10 ${
                        star <= (hoveredStar || rating) 
                        ? 'fill-[#E63121] text-[#E63121]' 
                        : 'text-gray-300'
                    }`} 
                  />
                </button>
             ))}
          </div>

          {/* Feedback Box */}
          <div className="w-full bg-gray-50 rounded-2xl p-4 h-40 border border-gray-100">
             <textarea 
                placeholder="Deixe um comentário..." 
                className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-sm text-gray-900 placeholder-gray-400"
             ></textarea>
          </div>
       </div>

       {/* Actions */}
       <div className="p-6 flex justify-between items-center border-t border-gray-100">
          <button 
            onClick={onSubmit}
            disabled={rating === 0}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${
                rating > 0 
                ? 'bg-[#E63121] hover:bg-[#0066CC] text-white opacity-100' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Enviar
          </button>

          <button 
            onClick={onSkip}
            className="text-gray-400 font-medium text-sm px-4 hover:text-gray-600"
          >
            Pular
          </button>
       </div>
    </div>
  );
};
