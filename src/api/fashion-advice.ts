import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";
import type { ClothingCategory, Look } from '../types';

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
        items, 
        style, 
        customPrompt, 
        suggestNewItems, 
        includeShoes, 
        includeAccessories 
    } = req.body as {
        items: ItemForApi[],
        style: string,
        customPrompt: string,
        suggestNewItems: boolean,
        includeShoes: boolean,
        includeAccessories: boolean
    };
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Por favor, selecione pelo menos uma peça de roupa do seu guarda-roupa." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const model = 'gemini-1.5-flash';
        const imageParts = items.map(item => fileToGenerativePart(item.base64, item.mimeType));

        let systemPrompt = `Você é um estilista de moda especialista e assistente pessoal de estilo. Sua tarefa é ajudar os usuários a criar looks incríveis com as roupas que eles já possuem.

O usuário forneceu imagens de suas peças, que ele categorizou da seguinte forma:
${items.some(i => i.category === 'top') ? '- Peças de Cima (Tops)\n' : ''}${items.some(i => i.category === 'bottom') ? '- Peças de Baixo (Bottoms)\n' : ''}${items.some(i => i.category === 'fullbody_outerwear') ? '- Peças Únicas / Casacos (Vestidos, Jaquetas)\n' : ''}${items.some(i => i.category === 'shoes') ? '- Sapatos\n' : ''}${items.some(i => i.category === 'accessory') ? '- Acessórios\n' : ''}
Use estas categorias como um guia fundamental para montar combinações lógicas (ex: uma peça de cima com uma de baixo). Analise as imagens fornecidas para identificar quais peças correspondem a cada categoria.

Sua tarefa é gerar 3 sugestões de looks distintos. Para cada sugestão, você deve seguir esta ordem estritamente:

1.  **CRIAR UMA IMAGEM DO LOOK:** Primeiro, crie a imagem. Analise as peças de roupa das imagens fornecidas. Selecione as melhores peças para criar um look completo baseado no estilo "${style}". Remova digitalmente o fundo de cada peça selecionada e organize-as de forma elegante em uma única imagem sobre um fundo branco liso. A imagem final deve ser uma imagem de produto limpa, mostrando apenas as peças de roupa sobre o fundo branco, sem nenhuma interface de usuário, molduras de dispositivo, barras de status ou qualquer outro elemento gráfico.

2.  **ESCREVER A DESCRIÇÃO DO LOOK:** Imediatamente após a imagem, forneça uma descrição em texto.
    -   A descrição deve corresponder exatamente à imagem que você acabou de criar.
    -   Descreva claramente quais peças das imagens foram combinadas.`;
    
        if (includeShoes) {
            systemPrompt += `
    -   **Sapatos:** Complete o look sugerindo sapatos específicos. Tente incluir estes itens na imagem gerada.`;
        }
        
        if (includeAccessories) {
            systemPrompt += `
    -   **Acessórios:** Complete o look sugerindo acessórios específicos (bolsas, cintos, joias). Tente incluir estes itens na imagem gerada.`;
        }

        if (suggestNewItems) {
            systemPrompt += `
    -   **Sugestão de Compra:** Se apropriado, sugira a compra de UMA ou DUAS novas peças que não estão nas fotos mas que complementariam o look perfeitamente. Destaque essa sugestão e explique por que seria uma boa compra.`;
        } else {
            systemPrompt += `
    -   Se uma peça crucial estiver faltando para completar o look (como uma calça, se apenas uma blusa foi enviada), sugira um item genérico para completar (ex: "combine com uma calça jeans de corte reto").`;
        }

        systemPrompt += `
    -   Se houver um pedido específico do usuário, leve-o em consideração: "${customPrompt || 'Nenhum pedido específico.'}".
    -   Formate sua resposta de forma clara, usando um título para o look (ex: "**SUGESTÃO DE LOOK 1**") e listas para as peças. Seja encorajador e positivo.

O formato da sua resposta final deve ser uma sequência estrita de pares imagem-texto:
[Imagem do Look 1]
[Texto do Look 1]
[Imagem do Look 2]
[Texto do Look 2]
[Imagem do Look 3]
[Texto do Look 3]`;

        // --- CORREÇÃO: "contents" DEVE SER UM ARRAY ---
        const response = await ai.models.generateContent({
            model: model,
            contents: [ // Adicionado colchete de abertura
                {
                    parts: [
                        { text: systemPrompt },
                        ...imageParts
                    ]
                }
            ], // Adicionado colchete de fecho
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        // --- FIM DA CORREÇÃO ---

        const looks: Omit<Look, 'id' | 'isFavorited'>[] = [];
        let currentImage: string | null = null;
        
        const parts = response?.candidates?.[0]?.content?.parts;
        if (!parts || parts.length === 0) {
            throw new Error("A IA não conseguiu gerar sugestões. Verifique as imagens e tente novamente.");
        }

        for (const part of parts) {
            if ('inlineData' in part && part.inlineData) {
                if (!part.inlineData.data) {
                    continue;
                }
                const base64ImageBytes = part.inlineData.data;
                const mimeType = part.inlineData.mimeType ?? 'image/png';
                currentImage = `data:${mimeType};base64,${base64ImageBytes}`;
            } else if ('text' in part && part.text) {
                looks.push({
                    image: currentImage,
                    description: part.text,
                });
                currentImage = null; 
            }
        }

        if (looks.length === 0) {
            throw new Error("A IA não conseguiu gerar sugestões. Verifique as imagens e tente novamente.");
        }

        return res.status(200).json(looks);

    } catch (error) {
        console.error("Error in Gemini API call (fashion-advice):", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return res.status(500).json({ error: errorMessage || "Não foi possível obter a sugestão de moda. Tente novamente." });
    }
}