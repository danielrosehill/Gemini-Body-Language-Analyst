
import { GoogleGenAI, Part } from "@google/genai";
import { TaggedImage } from '../types';

const MODEL_NAME = "gemini-2.5-flash";

export const analyzeBodyLanguage = async (
  prompt: string,
  images: TaggedImage[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are an expert in non-verbal communication, psychology, and body language. Your task is to provide an expert-level analysis of the body language displayed in the provided image(s).
- Analyze posture, gestures, facial expressions, eye contact, and proxemics (use of space).
- If people are tagged with names, refer to them by name in your analysis.
- If context is provided, incorporate it into your analysis to understand the relationships and situation.
- Structure your analysis clearly. Start with an overall summary, then provide detailed observations for each person or interaction.
- Conclude with your interpretation of the overall emotional tone and dynamics of the scene.
- Your response must be in Markdown format.`;

  let fullPrompt = `Please analyze the following image(s).\n\n`;

  if (prompt) {
    fullPrompt += `Context from the user: "${prompt}"\n\n`;
  }

  images.forEach((image, index) => {
    fullPrompt += `--- Image ${index + 1} ---\n`;
    if (image.tags.length > 0) {
      fullPrompt += `The following people are tagged in this image:\n`;
      image.tags.forEach(tag => {
        fullPrompt += `- '${tag.name}' is located at approximate coordinates (x: ${tag.x}, y: ${tag.y}).\n`;
      });
    } else {
      fullPrompt += `No people were tagged in this image.\n`;
    }
    fullPrompt += `\n`;
  });

  const imageParts: Part[] = images.map(image => ({
    inlineData: {
      mimeType: image.file.type,
      data: image.base64,
    },
  }));

  try {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: fullPrompt }, ...imageParts] },
        config: {
            systemInstruction: systemInstruction,
        },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while analyzing the images: ${error.message}`;
    }
    return "An unknown error occurred while analyzing the images.";
  }
};
