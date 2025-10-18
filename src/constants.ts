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
    { id: 'avatar1', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', alt: 'Modelo com cabelo escuro e pele clara' },
    { id: 'avatar2', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', alt: 'Modelo com cabelo loiro e pele clara' },
    { id: 'avatar3', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', alt: 'Modelo com cabelo escuro e pele escura' },
    { id: 'avatar4', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', alt: 'Modelo com cabelo ruivo e pele clara' },
];