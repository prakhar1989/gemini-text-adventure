
import { GoogleGenAI, Type } from "@google/genai";
import type { StorySegment } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storySchema = {
  type: Type.OBJECT,
  properties: {
    scene: {
      type: Type.STRING,
      description: "A vivid, one-paragraph description of the current environment and atmosphere. This will be used to generate an image. Focus on visual details."
    },
    situation: {
      type: Type.STRING,
      description: "A one-paragraph description of the immediate situation or challenge the player faces. Build tension or mystery."
    },
    choices: {
      type: Type.ARRAY,
      description: "An array of 3 or 4 short, actionable choices for the player (e.g., 'Inspect the glowing runes', 'Follow the faint whisper'). If the story has reached a conclusive end (good or bad), one of the choices must be 'The End.'",
      items: {
        type: Type.STRING
      }
    }
  },
  required: ["scene", "situation", "choices"]
};


export const generateStorySegment = async (playerInput: string, storyHistory: string): Promise<StorySegment | null> => {
  const prompt = `You are a master storyteller for a text-based adventure game.
  The player's last action was: "${playerInput}".
  The story so far has been: "${storyHistory}".
  Continue the story with a new, creative development. The tone is epic fantasy with a hint of mystery.
  Generate the next scene, situation, and choices. Avoid cliches. Be descriptive and engaging.
  If the story has reached a natural and conclusive end, make one of the choices "The End."
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.9,
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) return null;
    
    return JSON.parse(jsonText) as StorySegment;
  } catch (error) {
    console.error("Error generating story segment:", error);
    throw new Error("The storyteller seems to have lost their train of thought. Please try again.");
  }
};


export const generateSceneImage = async (prompt: string): Promise<string> => {
    const imagePrompt = `Epic fantasy digital painting of the following scene: ${prompt}. Cinematic lighting, high detail, immersive atmosphere, style of an epic RPG splash screen.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }

    } catch (error) {
        console.error("Error generating scene image:", error);
        throw new Error("The world's vision blurs... failed to generate an image.");
    }
};
