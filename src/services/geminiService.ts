import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResponse } from '../types';

const API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

// Initialize AI only if key is present
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const analyzeFeedback = async (
  feedbackText: string, 
  rating: number
): Promise<FeedbackResponse> => {
  
  // Fallback if no API key is configured
  if (!ai) {
    return {
      sentiment: rating >= 4 ? 'positive' : 'negative',
      responseMessage: "Obrigado pelo seu feedback! Registramos sua opinião.",
      followUpAction: "Nenhuma"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Nota do Usuário: ${rating}/5. Comentário: "${feedbackText}". Analise este feedback para um aplicativo de transporte em Angola. Responda em JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              enum: ["positive", "neutral", "negative"],
              description: "Sentimento do feedback"
            },
            responseMessage: {
              type: Type.STRING,
              description: "Uma resposta educada e curta para o cliente em Português de Portugal/Angola."
            },
            followUpAction: {
              type: Type.STRING,
              description: "Ação interna a tomar (ex: 'Reembolso', 'Promover Motorista', 'Nenhuma')"
            }
          },
          required: ["sentiment", "responseMessage", "followUpAction"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FeedbackResponse;
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      sentiment: 'neutral',
      responseMessage: "Obrigado pelo seu feedback.",
      followUpAction: "Nenhuma"
    };
  }
};