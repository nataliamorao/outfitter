import { StyleOption, Avatar } from './types';

export const FASHION_STYLES: StyleOption[] = [
  { 
    value: 'casual', 
    label: 'Casual', 
    description: 'Conforto e praticidade para o dia a dia. Pense em jeans, camisetas, tênis e malhas.' 
  },
  { 
    value: 'elegante', 
    label: 'Elegante', 
    description: 'Sofisticação e refinamento. Peças de alfaiataria, tecidos nobres, cortes clássicos e cores neutras.' 
  },
  { 
    value: 'esportivo', 
    label: 'Esportivo', 
    description: 'Influência do universo dos esportes. Roupas confortáveis como moletons, leggings, jaquetas bomber e tênis.' 
  },
  { 
    value: 'boho', 
    label: 'Boho', 
    description: 'Estilo boêmio e hippie. Estampas étnicas, franjas, tecidos fluidos, batas e acessórios artesanais.' 
  },
  { 
    value: 'minimalista', 
    label: 'Minimalista', 
    description: '"Menos é mais". Cores neutras, cortes retos, pouca estampa e foco na qualidade das peças.' 
  },
  { 
    value: 'criativo', 
    label: 'Criativo', 
    description: 'Originalidade e ousadia. Mistura de estampas, cores vibrantes, texturas e peças statement.' 
  },
  { 
    value: 'romantico', 
    label: 'Romântico', 
    description: 'Delicadeza e feminilidade. Laços, babados, estampas florais, tons pastel e tecidos leves.' 
  },
  { 
    value: 'rocker', 
    label: 'Rocker', 
    description: 'Atitude e rebeldia. Couro, tachas, jeans rasgado, camisetas de banda e coturnos.' 
  },
];

export const CLOTHING_CATEGORIES = [
  { value: 'uncategorized', label: 'Selecione uma categoria' },
  { value: 'top', label: 'Peça de Cima (Top)' },
  { value: 'bottom', label: 'Peça de Baixo (Bottom)' },
  { value: 'fullbody_outerwear', label: 'Peça Única / Casaco' },
  { value: 'shoes', label: 'Sapatos' },
  { value: 'accessory', label: 'Acessório' },
];

export const AVATARS: Avatar[] = [
    { id: 'avatar1', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwKSI+CiAgICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPgogICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNTUiIHI9IjQwIiBmaWxsPSIjNDE0MDQwIi8+CiAgICA8cGF0aCBkPSJNMCAzMDBIMjAwVjEwMEMxNzAgMTMwIDEzMCAxMzAgMTAwIDEwMEM3MCAxMzAgMzAgMTMwIDAgMTAwWiIgZmlsbD0iIzQxNDA0MCIvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iY2xpcDAiPgogICAgICAicmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgcng9IjEwIiByeT0iMTAiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgo8L3N2Zz4K', alt: 'Silhueta de modelo 1' },
    { id: 'avatar2', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAxKSI+CiAgICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPgogICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNTUiIHI9IjQwIiBmaWxsPSIjNjM2MjYyIi8+CiAgICA8cGF0aCBkPSJNMCAzMDBIMjAwVjEwMEMxNzAgMTQwIDEzMCAxNDAgMTAwIDEwMEM3MCAxNDAgMzAgMTQwIDAgMTAwWiIgZmlsbD0iIzYzNjI2MiIvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iY2xpcDEiPgogICAgICAicmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgcng9IjEwIiByeT0iMTAiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgo8L3N2Zz4K', alt: 'Silhueta de modelo 2' },
    { id: 'avatar3', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAyKSI+CiAgICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPgogICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNTUiIHI9IjQwIiBmaWxsPSIjMmQyYzJjIi8+CiAgICA8cGF0aCBkPSJNMCAzMDBIMjAwVjExMEMxNzUgMTMwIDEyNSAxMzAgMTAwIDExMEM3NSAxMzAgMjUgMTMwIDAgMTEwWiIgZmlsbD0iIzJkMmMyYyIvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iY2xpcDIiPgogICAgICAicmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgcng9IjEwIiByeT0iMTAiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgo8L3N2Zz4K', alt: 'Silhueta de modelo 3' },
    { id: 'avatar4', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAzKSI+CiAgICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPgogICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNTUiIHI9IjQwIiBmaWxsPSIjN2E3OTc5Ii8+CiAgICA8cGF0aCBkPSJNMCAzMDBIMjAwVjEwNUMxNjAgMTQ1IDE0MCAxNDUgMTAwIDEwNUM2MCAxNDUgNDAgMTQ1IDAgMTA1WiIgZmlsbD0iIzdhNzk3OSIvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iY2xpcDMiPgogICAgICAicmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgcng9IjEwIiByeT0iMTAiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgo8L3N2Zz4K', alt: 'Silhueta de modelo 4' },
];