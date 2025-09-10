import { GoogleGenAI, Modality, Part } from "@google/genai";
import { GenerationMode, InputImage } from "../types";
import { BLANK_PIXEL_B64, BLANK_PIXEL_MIME_TYPE } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image-preview';

export const generateWithNanoBanana = async (
    prompt: string,
    inputImages: InputImage[],
    mode: GenerationMode
): Promise<{ image: string | null; text: string | null }> => {
    
    const parts: Part[] = [];

    // Add image parts
    if (mode === GenerationMode.TextToImage) {
        // For T2I, use a blank pixel as the base image for nano-banana
        parts.push({
            inlineData: {
                data: BLANK_PIXEL_B64,
                mimeType: BLANK_PIXEL_MIME_TYPE,
            },
        });
    } else {
        if (inputImages.length === 0) {
            throw new Error("此生成模式需要至少一張圖片。");
        }
        inputImages.forEach(img => {
            parts.push({
                inlineData: {
                    data: img.base64,
                    mimeType: img.mimeType,
                },
            });
        });
    }

    // Add text part
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let generatedImage: string | null = null;
    let generatedText: string | null = null;

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && !generatedImage) {
                const base64ImageBytes = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                generatedImage = `data:${mimeType};base64,${base64ImageBytes}`;
            } else if (part.text) {
                generatedText = part.text;
            }
        }
    }

    if (!generatedImage) {
        throw new Error("API 未返回圖片。可能因安全設定而被阻擋。");
    }

    return { image: generatedImage, text: generatedText };
};