import { StyleOption, Avatar } from './types.ts';

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

// NOTE: Using placeholder base64 images as the virtual try-on code expects this format.
// Replace these with actual base64 images of models for the final version.
export const AVATARS: Avatar[] = [
    { id: 'avatar1', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAPNJREFUeF7t0EENwDAAAMHq/0d3oQAb2i3uJgEBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBfwM2qQEGAALx/gAAAABJRU5ErkJggg==', alt: 'Modelo com cabelo escuro e pele clara' },
    { id: 'avatar2', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAOJJREFUeF7t0LENwzAQBEHw/88950BQICh3p5lPAQECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIECBP4MWAAGmID+HwAAAABJRU5ErkJggg==', alt: 'Modelo com cabelo loiro e pele clara' },
    { id: 'avatar3', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAANtJREFUeF7t0DEBAAAAwiD7P2k8sHVoBwECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEDgLwECgAAbsgAB2QAAAABJRU5ErkJggg==', alt: 'Modelo com cabelo escuro e pele escura' },
    { id: 'avatar4', src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAOJJREFUeF7t0LENwzAQBEHw/88950BQICh3p5lPAQECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIECBP4MWAAGmID+HwAAAABJRU5ErkJggg==', alt: 'Modelo com cabelo ruivo e pele clara' },
];