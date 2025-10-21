import { GoogleGenAI, Modality } from "@google/genai";
import { ClothingCategory, Look } from "../types";

type ItemForApi = {
  base64: string;
  mimeType: string;
  category: ClothingCategory;
}

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType
    },
  };
}

// FIX: Per the coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`. This also resolves the TypeScript error for `import.meta.env`.
const API_KEY = process.env.API_KEY;

export async function getFashionAdvice(
  items: ItemForApi[],
  style: string,
  customPrompt: string,
  suggestNewItems: boolean,
  includeShoes: boolean,
  includeAccessories: boolean,
): Promise<Omit<Look, 'id' | 'isFavorited'>[]> {
  if (!API_KEY) {
    throw new Error("API key for Gemini is not set.");
  }
  if (items.length === 0) {
    throw new Error("Por favor, selecione pelo menos uma peça de roupa do seu guarda-roupa.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  // FIX: Switched to a more capable model for complex multimodal generation.
  const model = 'gemini-2.5-flash-image';

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


  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: systemPrompt },
          ...imageParts
        ]
      },
    });

    const looks: Omit<Look, 'id' | 'isFavorited'>[] = [];
    let currentImage: string | null = null;
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        currentImage = `data:${mimeType};base64,${base64ImageBytes}`;
      } else if (part.text) {
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

    return looks;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Não foi possível obter a sugestão de moda. Tente novamente.");
  }
}


export async function virtualTryOn(
  avatar: { base64: string, mimeType: string },
  items: ItemForApi[]
): Promise<string> {
  if (!API_KEY) {
    throw new Error("API key for Gemini is not set.");
  }
  if (items.length === 0) {
    throw new Error("Por favor, selecione pelo menos uma peça de roupa para provar.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-2.5-flash-image';

  const avatarPart = fileToGenerativePart(avatar.base64, avatar.mimeType);
  const clothingParts = items.map(item => fileToGenerativePart(item.base64, item.mimeType));

  const systemPrompt = `Você é um especialista em provador virtual de IA. Sua tarefa é vestir a pessoa na primeira imagem (o modelo) com as roupas fornecidas nas imagens subsequentes.
  - Analise o modelo e as peças de roupa.
  - Projete as roupas sobre o corpo do modelo de forma realista, respeitando a perspectiva, o caimento do tecido e a iluminação.
  - Mantenha a pose original, a forma do corpo e o fundo da imagem do modelo intactos.
  - O resultado final deve ser uma única imagem fotorrealista do modelo vestindo as roupas selecionadas.
  - Não inclua NENHUM texto em sua resposta, apenas a imagem final.`;

  try {
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

    const part = response.candidates[0].content.parts[0];
    if (part && part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    } else {
      throw new Error("A IA não retornou uma imagem válida.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for virtual try-on:", error);
    throw new Error("Não foi possível gerar a imagem do provador. Tente novamente.");
  }
}