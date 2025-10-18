// Adaptado para aplicación de moda virtual
export interface FashionMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    image?: GeneratedImage;
    imageLoading?: boolean;
  }
  
  export interface GeneratedImage {
    base64Data: string;
    mediaType: string;
    uint8ArrayData?: Uint8Array;
  }
  
  // Nuevos tipos específicos para fashion try-on
  export interface ModelUpload {
    id: string;
    image: string; // base64
    name?: string;
  }
  
  export interface GarmentUpload {
    id: string;
    image: string; // base64
    type: 'shirt' | 'pants' | 'dress' | 'jacket' | 'shoes' | 'accessories';
    name?: string;
  }
  
  // Agrega estos tipos a tu archivo existente
  export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
  }
  
  export interface GenerateFashionRequest {
    userMessage: string;
    conversationHistory: ConversationMessage[];
    isStart: boolean;
    mode: 'catalog' | 'tryon'; // Nueva funcionalidad para tu negocio
    modelImage?: string; // base64 image data
    garmentImage?: string; // base64 image data
    customerImage?: string; // base64 image data for tryon mode
    generatedImage?: string; // base64 de imagen ya generada por Nano Banana
  }
  
  export interface GenerateFashionResponse {
    story: string;
    imagePrompt: string;
  }

  export interface GenerateImageRequest {
    imagePrompt: string;
  }

  // Agregar estas interfaces al archivo existente
  export interface CatalogResponse {
    story: string;
    imagePrompt: string;
  }
  
  export interface ImageResponse {
    image: {
      base64Data: string;
      mediaType: string;
    } | null;
  }

  // Nuevos tipos para el sistema de catálogo
  export interface CatalogItem {
    id: string;
    title: string;
    description: string;
    image: GeneratedImage;
    modelImage: string; // base64 de la imagen original del modelo
    garmentImage: string; // base64 de la imagen original de la prenda
    createdAt: Date;
    tags?: string[];
    // Metadatos para filtrado inteligente
    metadata?: {
      garmentType: 'camisa' | 'pantalon' | 'vestido' | 'falda' | 'chaqueta' | 'sueter' | 'blusa' | 'shorts' | 'otro';
      colors: string[]; // ['rojo', 'azul', 'verde']
      style: 'formal' | 'casual' | 'deportivo' | 'elegante' | 'nocturno';
      gender: 'hombre' | 'mujer' | 'unisex';
      season: 'verano' | 'invierno' | 'primavera' | 'otoño' | 'todo_año';
      occasion: 'trabajo' | 'fiesta' | 'casual' | 'deporte' | 'noche';
    };
  }

  export interface CatalogState {
    items: CatalogItem[];
    selectedItem: CatalogItem | null;
  }