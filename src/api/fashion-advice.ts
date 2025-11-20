import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

import type { ClothingCategory, Look } from "../types";

const GEMINI_API_KEY = process.env.API_KEY;

type ItemForApi = {
  base64: string;
  mimeType: string;
  category: ClothingCategory;
};

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.startsWith("data:") ? base64.split(",")[1] : base64,
      mimeType,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ error: "API key for Gemini is not set on the server." });
  }

  const {
    items,
    style,
    customPrompt,
    suggestNewItems,
    includeShoes,
    includeAccessories,
  } = req.body as {
    items: ItemForApi[];
    style: string;
    customPrompt: string;
    suggestNewItems: boolean;
    includeShoes: boolean;
    includeAccessories: boolean;
  };

  if (!items || items.length === 0) {
    return res.status(400).json({
      error:
        "Por favor, selecione pelo menos uma peça de roupa do seu guarda-roupa.",
    });
  }

  try {
    // ---------------------------
    // 🔥 Gemini client (versão atual)
    // ---------------------------
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const imageParts = items.map((item) =>
      fileToGenerativePart(item.base64, item.mimeType)
    );

    // ---------------------------
    // 📝 Prompt estruturado
    // ---------------------------
    let systemPrompt = `Você é um estilista de moda especialista e assistente pessoal de estilo. Sua tarefa é ajudar os usuários a criar looks incríveis com as roupas que eles já possuem.

O usuário forneceu imagens de peças categorizadas como:
${items.some((i) => i.category === "top") ? "- Peças de Cima (Tops)\n" : ""}${
      items.some((i) => i.category === "bottom")
        ? "- Peças de Baixo (Bottoms)\n"
        : ""
    }${
      items.some((i) => i.category === "fullbody_outerwear")
        ? "- Peças Únicas ou Casacos\n"
        : ""
    }${items.some((i) => i.category === "shoes") ? "- Sapatos\n" : ""}${
      items.some((i) => i.category === "accessory") ? "- Acessórios\n" : ""
    }

Gere 3 sugestões de looks seguindo esta ordem:
1. Crie uma imagem do look (organize as peças sobre fundo branco).
2. Escreva a descrição do look, explicando quais peças foram combinadas.`;

    if (includeShoes) {
      systemPrompt += `
- Inclua sapatos no look sempre que possível.`;
    }

    if (includeAccessories) {
      systemPrompt += `
- Adicione acessórios relevantes ao look quando fizer sentido.`;
    }

    if (suggestNewItems) {
      systemPrompt += `
- Sugira 1 ou 2 peças adicionais de compra que complementariam o look.`;
    } else {
      systemPrompt += `
- Se alguma peça essencial estiver faltando, sugira um item genérico para completar o look.`;
    }

    systemPrompt += `
- Pedido específico do usuário: "${customPrompt || "Nenhum"}"

Formato final estrito:
[Imagem Look 1]
[Texto Look 1]
[Imagem Look 2]
[Texto Look 2]
[Imagem Look 3]
[Texto Look 3]`;

    // ---------------------------
    // 🚀 Chamada à API
    // ---------------------------
    const response = await model.generateContent({
        contents: [
       {
      role: "system",              // <-- adicionado
      parts: [
        { text: systemPrompt },    // texto do prompt
        ...imageParts              // partes com inlineData (as imagens)
      ],
    },
  ],
});

    // ---------------------------
    // 📦 Extração dos resultados
    // ---------------------------
    const parts =
      response.response?.candidates?.[0]?.content?.parts ?? [];

    const looks: Omit<Look, "id" | "isFavorited">[] = [];
    let currentImage: string | null = null;

    for (const part of parts) {
      if ("inlineData" in part && part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType ?? "image/png";
        currentImage = `data:${mimeType};base64,${part.inlineData.data}`;
      } else if ("text" in part && part.text) {
        looks.push({
          image: currentImage,
          description: part.text,
        });
        currentImage = null;
      }
    }

    // fallback caso venha só texto
    if (looks.length === 0) {
      const textOnly = parts
        .filter((p) => "text" in p && p.text)
        .map((p) => p.text)
        .join("\n");

      looks.push({
        image: null,
        description: textOnly || "Não foi possível gerar sugestões.",
      });
    }

    return res.status(200).json(looks);
  } catch (error) {
    console.error("Error in Gemini API call (fashion-advice):", error);
    return res.status(500).json({
      error:
        (error as Error).message ||
        "Não foi possível obter as sugestões de moda.",
    });
  }
}
