import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
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
    
    if (!avatar) {
        return res.status(400).json({ error: "Por favor, envie uma foto de corpo inteiro." });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Por favor, selecione pelo menos uma peça de roupa." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const model = 'gemini-1.5-flash'; 

        const imageParts = [
            fileToGenerativePart(avatar.base64, avatar.mimeType),
            ...items.map(item => fileToGenerativePart(item.base64, item.mimeType))
        ];
        
        const itemCategories = items.map(i => i.category).join(', ');

        const systemPrompt = `
Você é um especialista em "provador virtual". Sua única tarefa é pegar a imagem de uma pessoa (avatar) e as imagens de várias peças de roupa e gerar uma nova imagem ÚNICA da pessoa vestindo APENAS as peças de roupa fornecidas.

- **Avatar:** A primeira imagem é a pessoa.
- **Peças de Roupa:** As imagens seguintes são as peças (${itemCategories}).

**Instruções:**
1.  **Analise o Avatar:** Identifique a pose e o corpo da pessoa na primeira imagem.
2.  **Analise as Peças:** Identifique as peças de roupa nas imagens seguintes.
3.  **Crie a Imagem:** Gere uma nova imagem fotorrealista da pessoa da primeira imagem vestindo as peças de roupa fornecidas. A imagem deve ser limpa, focada na pessoa e nas roupas, sobre um fundo branco liso.
4.  **RESTRITO:** Sua resposta deve ser APENAS a imagem. Não inclua NENHUM texto, descrição, markdown ou qualquer outra coisa. Apenas a imagem.
`;

        const response = await ai.models.generateContent({
            model: model,
            contents: [ // <-- Adicione um colchete aqui
                {
                    parts: [
                        { text: systemPrompt },
                        ...imageParts
                    ]
                }
            ], // <-- E feche o colchete aqui
            config: {
                responseMimeType: "image/png",
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType ?? 'image/png';
            const finalImage = `data:${mimeType};base64,${base64ImageBytes}`;
            return res.status(200).json({ image: finalImage });
        } else {
            throw new Error("A IA não conseguiu gerar a imagem do provador.");
        }

    } catch (error) {
        console.error("Error in Gemini API call (virtual-tryon):", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return res.status(500).json({ error: errorMessage || "Não foi possível gerar a imagem do provador. Tente novamente." });
    }
}