import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";
import type { ClothingCategory } from '../types';

const GEMINI_API_KEY = process.env.API_KEY;

type ItemForApi = {
  base64: string;
  mimeType: string;
  category: ClothingCategory;
}

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.startsWith('data:') ? base64.split(',')[1] : base64,
      mimeType
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key for Gemini is not set on the server.' });
    }

    const { 
        avatar,
        items
    } = req.body as {
        avatar: { base64: string, mimeType: string },
        items: ItemForApi[]
    };

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Por favor, selecione pelo menos uma peça de roupa para provar." });
    }
    if (!avatar) {
        return res.status(400).json({ error: "Por favor, selecione um modelo." });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const model = 'gemini-2.5-flash-image';

        const avatarPart = fileToGenerativePart(avatar.base64, avatar.mimeType);
        const clothingParts = items.map(item => fileToGenerativePart(item.base64, item.mimeType));

        const systemPrompt = `Você é um especialista em provador virtual de IA. Sua tarefa é vestir a pessoa na primeira imagem (o modelo) com as roupas fornecidas nas imagens subsequentes.
  - Analise o modelo e as peças de roupa.
  - Projete as roupas sobre o corpo do modelo de forma realista, respeitando a perspectiva, o caimento do tecido e a iluminação.
  - Mantenha a pose original, a forma do corpo e o fundo da imagem do modelo intactos.
  - O resultado final deve ser uma única imagem fotorrealista do modelo vestindo as roupas selecionadas.
  - Não inclua NENHUM texto em sua resposta, apenas a imagem final.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                { text: systemPrompt },
                avatarPart,
                ...clothingParts
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const imagePart = response?.candidates?.[0]?.content?.parts?.find(p => 'inlineData' in p && p.inlineData);

        if (imagePart && 'inlineData' in imagePart) {
            const base64ImageBytes = imagePart.inlineData?.data;
            const mimeType = imagePart.inlineData?.mimeType;

            // Ensure we have both data and mimeType before constructing the data URL
            if (!base64ImageBytes || !mimeType) {
                throw new Error("A IA não retornou uma imagem válida.");
            }

            const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
            return res.status(200).json({ image: imageUrl });
        } else {
            throw new Error("A IA não retornou uma imagem válida.");
        }
    } catch (error) {
        console.error("Error in Gemini API call (virtual-tryon):", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return res.status(500).json({ error: errorMessage || "Não foi possível gerar a imagem do provador. Tente novamente." });
    }
}