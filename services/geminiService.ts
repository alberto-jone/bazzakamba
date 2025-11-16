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
      responseMessage: "Thank you for your feedback! We have recorded your response locally.",
      followUpAction: "None"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Rating: ${rating}/5. User Feedback: "${feedbackText}". Analyze this feedback for a ride-sharing app.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              enum: ["positive", "neutral", "negative"],
              description: "The sentiment of the feedback"
            },
            responseMessage: {
              type: Type.STRING,
              description: "A polite, customer-service oriented response to the user, max 2 sentences."
            },
            followUpAction: {
              type: Type.STRING,
              description: "Internal action to take (e.g., 'Refund', 'Promote Driver', 'None')"
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
      responseMessage: "Thank you for your feedback.",
      followUpAction: "None"
    };
  }
};