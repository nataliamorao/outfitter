import { ClothingCategory, Look } from "../types";

type ItemForApi = {
  base64: string;
  mimeType: string;
  category: ClothingCategory;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Erro no servidor: ${response.statusText}` }));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
  return response.json();
}

export async function getFashionAdvice(
  items: ItemForApi[],
  style: string,
  customPrompt: string,
  suggestNewItems: boolean,
  includeShoes: boolean,
  includeAccessories: boolean,
): Promise<Omit<Look, 'id' | 'isFavorited'>[]> {
  if (items.length === 0) {
    throw new Error("Por favor, selecione pelo menos uma peça de roupa do seu guarda-roupa.");
  }

  try {
    const response = await fetch('/api/fashion-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        style,
        customPrompt,
        suggestNewItems,
        includeShoes,
        includeAccessories,
      }),
    });
    
    return await handleApiResponse<Omit<Look, 'id' | 'isFavorited'>[]>(response);

  } catch (error) {
    console.error("Error calling fashion advice API:", error);
    if (error instanceof Error) {
        throw new Error(error.message || "Não foi possível obter a sugestão de moda. Tente novamente.");
    }
    throw new Error("Não foi possível obter a sugestão de moda. Tente novamente.");
  }
}


export async function virtualTryOn(
  avatar: { base64: string, mimeType: string },
  items: ItemForApi[]
): Promise<string> {
  if (items.length === 0) {
    throw new Error("Por favor, selecione pelo menos uma peça de roupa para provar.");
  }

  try {
    const response = await fetch('/api/virtual-tryon', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar, items }),
    });

    const result = await handleApiResponse<{ image: string }>(response);
    return result.image;

  } catch (error) {
    console.error("Error calling virtual try-on API:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "Não foi possível gerar a imagem do provador. Tente novamente.");
    }
    throw new Error("Não foi possível gerar a imagem do provador. Tente novamente.");
  }
}
