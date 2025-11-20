import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAI } from "@google/genai";
import type { ClothingCategory } from '../types';

const GEMINI_API_KEY = process.env.API_KEY;

// Tipagem dos itens recebidos do frontend
type ItemForApi = {
  base64: string;
  mimeType: string;
  category: ClothingCategory;
};

// Tipagem das partes retornadas pelo Gemini
type GeminiPart = {
  inlineData?: { data: string; mimeType: string };
  text?: string;
};

// Converte base64 para o formato aceito pelo Gemini
function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.startsWith("data:")
        ? base64.split(",")[1]
        : base64,
      mimeType,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key for Gemini is not set on the server." });
  }

  const { avatar, items } = req.body as {
    avatar: { base64: string; mimeType: string };
    items: ItemForApi[];
  };

  if (!avatar) {
    return res.status(400).json({ error: "Por favor, envie uma foto de corpo inteiro." });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Por favor, selecione pelo menos uma peça de roupa." });
  }

  try {
    // Inicializa Gemini API (biblioteca nova @google/genai)
    const genAI = new GoogleAI({
      apiKey: GEMINI_API_KEY,
    });

    // Seleciona o modelo
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Imagens enviadas ao modelo
    const imageParts = [
      fileToGenerativePart(avatar.base64, avatar.mimeType),
      ...items.map((item) => fileToGenerativePart(item.base64, item.mimeType)),
    ];

    const itemCategories = items.map((i) => i.category).join(", ");

    const systemPrompt = `
Você é um especialista em "provador virtual". Sua única tarefa é gerar uma nova imagem fotorrealista do avatar usando APENAS as roupas enviadas.

Regras:
1. A primeira imagem é o avatar (a pessoa).
2. As demais imagens são as roupas: ${itemCategories}.
3. Gere uma imagem fotorrealista do avatar vestindo somente essas roupas.
4. Sem texto, sem explicações. Retorne SOMENTE a imagem.
`;

    // Chamada ao modelo
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            ...imageParts,
          ],
        },
      ],
      config: {
        responseMimeType: "image/png",
      },
    });

    // Extrai resposta (padrão do SDK novo)
    const imagePart: GeminiPart | undefined =
      response.response?.candidates?.[0]?.content?.parts?.find(
        (p: GeminiPart) => p.inlineData
      );

    if (imagePart && imagePart.inlineData) {
      const base64 = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType ?? "image/png";

      const finalImage = `data:${mimeType};base64,${base64}`;

      return res.status(200).json({ image: finalImage });
    }

    // A IA retornou texto ao invés de imagem
    const textResponse =
      response.response?.candidates?.[0]?.content?.parts?.find(
        (p: GeminiPart) => p.text
      )?.text;

    if (textResponse) {
      throw new Error(`A IA retornou texto em vez de imagem: ${textResponse}`);
    }

    throw new Error("A IA não conseguiu gerar a imagem do provador.");
  } catch (error) {
    console.error("Error in Gemini API call (virtual-tryon):", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
