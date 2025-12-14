import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const convertNudiToUnicode = async (asciiText: string): Promise<string> => {
  if (!asciiText.trim()) return "";

  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are a specialized linguistic conversion engine. 
    Your strict task is to convert text encoded in "Kannada Nudi" (a legacy ASCII font encoding used for the Kannada language) into standard "Kannada Unicode" text.
    
    Rules:
    1. Input text will be gibberish-looking ASCII characters (e.g., "PÀ£ÀßqÀ") or mixed content.
    2. Output MUST be the valid Kannada Unicode equivalent (e.g., "ಕನ್ನಡ").
    3. If the input contains standard English words mixed with Nudi, preserve the English words as they are.
    4. If the input is already Kannada Unicode, return it as is.
    5. Do not provide any explanations, preambles, or markdown formatting blocks. 
    6. Return ONLY the raw converted string.
    
    Example Input: "£ÀªÀÄ¸ÁÌgÀ"
    Example Output: "ನಮಸ್ಕಾರ"
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: asciiText,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Conversion Error:", error);
    throw new Error("Failed to convert text using Gemini AI.");
  }
};

export const extractTextFromImage = async (base64Image: string, mimeType: string = "image/png"): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: "Examine this image. Extract any text visible in it. If the text appears to be 'Nudi' font (ASCII characters that look like gibberish English but map to Kannada), transcribe the ASCII characters exactly. If the text looks like standard English or numbers, transcribe them exactly. Return ONLY the raw text found, no explanations."
          }
        ]
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to extract text from image.");
  }
};