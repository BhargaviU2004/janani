import { GoogleGenAI } from "@google/genai";
import { MODELS } from "./gemini";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askJanani(message: string, profile: any) {
  const isEmergency = /bleeding|severe abdominal pain|no fetal movement|high fever/i.test(message);
  
  if (isEmergency) {
    return "[EMERGENCY ADVICE] Please contact your doctor or go to the nearest hospital immediately. This requires professional medical attention.";
  }

  const systemInstruction = `
    You are Janani, a cheerful and encouraging perinatal health specialist support assistant. 
    User current state: ${profile?.status || 'pregnant'}.
    Pregnancy Count: ${profile?.pregnancyCount || '1st'}.
    trimester: ${profile?.currentTrimester || 1}.
    
    Responsibilities:
    - Use cheerful and encouraging language.
    - Use light emojis: 🌟, 🤰, ✨, 👶.
    - Adjust advice based on whether it is the user's 1st, 2nd, or 3rd pregnancy. 
      - 1st: Detailed, reassuring, explaining basics.
      - 2nd/3rd: Efficient, acknowledging experience, focusing on multi-child dynamics.
    - Non-Medical Guide: Offer tips for mild issues (UTI, back pain, nausea) like hydration and posture.
    - Safety Guardrail: If user mentioned emergency symptoms, the system already caught it, but stay vigilant.
    
    Output Style: Use Markdown for readability. Keep responses concise but warm.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.HEALTH_ANALYSIS,
      contents: message,
      config: {
        systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Chatbot error:", error);
    return "I'm sorry, I'm having a little trouble connecting right now ✨. Please try again or consult your doctor if you have concerns.";
  }
}
