import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { FASHION_PROMPTS } from '@/lib/prompts';
import { translateToEnglish } from '@/lib/consts';
import { sanitizeModelImage } from '@/lib/image-sanitizer';

export interface GenerateImageRequest {
  imagePrompt: string;
  modelImage?: string; // base64 image data
  garmentImage?: string; // base64 image data
  mode?: 'catalog' | 'tryon'; // Modo específico para precisión
  garmentDescription?: string; // Descripción específica de la prenda
  personDescription?: string; // Descripción específica de la persona (modo tryon)
}

const GOOGLE_SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_ONLY_HIGH'
  },
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH'
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH'
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_ONLY_HIGH'
  }
];

// Prompts progresivos para retry inteligente
const PROGRESSIVE_PROMPTS = [
  (basePrompt: string) => `${basePrompt}`,
  (basePrompt: string) => `Create a fashion editorial composition featuring the garment elements from the references. Focus on professional catalog presentation and styling aesthetics.`,
  (basePrompt: string) => `Generate a high-end fashion photography setup combining the clothing elements. Professional studio lighting and commercial catalog quality.`,
  (basePrompt: string) => `Compose a sophisticated fashion editorial featuring the garment design. Clean, professional presentation suitable for commercial fashion catalog.`,
  (basePrompt: string) => `Create a fashion catalog image showcasing the clothing design with professional styling and editorial composition.`
];

async function generateWithRetry(
  content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }>, 
  mode: 'catalog' | 'tryon' = 'catalog',
  garmentDescription?: string,
  personDescription?: string,
  maxRetries = 5
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Intento ${attempt + 1} de ${maxRetries} - Modo: ${mode}`);
      
      // Seleccionar prompt específico según el modo
      let currentPrompt: string;
      
      if (mode === 'catalog') {
        // MODO DUEÑO: Máxima fidelidad de prenda
        const garmentDesc = garmentDescription || 'prenda elegante de alta calidad';
        currentPrompt = FASHION_PROMPTS.GENERATE_CATALOG_IMAGE(garmentDesc);
        console.log('Using CATALOG mode - Focus on garment accuracy');
      } else if (mode === 'tryon') {
        // MODO CLIENTE: Fidelidad persona + prenda
        const personDesc = personDescription || 'persona con características únicas';
        const garmentDesc = garmentDescription || 'prenda específica del catálogo';
        currentPrompt = FASHION_PROMPTS.GENERATE_TRYON_IMAGE(personDesc, garmentDesc);
        console.log('Using TRYON mode - Focus on person + garment accuracy');
      } else {
        // Fallback al prompt genérico
        const translatedPrompt = translateToEnglish('Modelo profesional portando prenda elegante');
        const promptFunction = PROGRESSIVE_PROMPTS[Math.min(attempt, PROGRESSIVE_PROMPTS.length - 1)];
        const basePrompt = FASHION_PROMPTS.GENERATE_IMAGE(translatedPrompt);
        currentPrompt = promptFunction(basePrompt);
        console.log('Using GENERIC mode - Fallback prompt');
      }
      
      // Actualizar el contenido de texto
      const updatedContent = [...content];
      updatedContent[0] = { type: 'text', text: currentPrompt };
      
      const { files } = await generateText({
        model: google('gemini-2.5-flash-image'),
        messages: [
          {
            role: 'user',
            content: updatedContent
          }
        ],
        providerOptions: {
          google: {
            responseModalities: ['IMAGE'],
            safetySettings: GOOGLE_SAFETY_SETTINGS
          }
        }
      });

      if (files && files.length > 0) {
        console.log(`Éxito en intento ${attempt + 1}`);
        return files[0];
      }
      
      // Si no hay files, esperar antes del siguiente intento
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      
    } catch (error: any) {
      console.log(`Error en intento ${attempt + 1}:`, error.message);
      
      if (error.message?.includes('SAFETY') || error.message?.includes('PROHIBITED_CONTENT')) {
        // Para errores de seguridad, esperar más tiempo
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
        }
      } else {
        // Para otros errores, esperar menos
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      imagePrompt, 
      modelImage, 
      garmentImage, 
      mode = 'catalog',
      garmentDescription,
      personDescription 
    }: GenerateImageRequest = await request.json();

    console.log('=== INICIO GENERACIÓN DE IMAGEN ===');
    console.log('Mode:', mode);
    console.log('Model image available:', !!modelImage);
    console.log('Garment image available:', !!garmentImage);
    console.log('Garment description:', garmentDescription?.substring(0, 50) + '...');
    console.log('Person description:', personDescription?.substring(0, 50) + '...');

    const sanitizedModelImage = await sanitizeModelImage(modelImage);
    
    // Los análisis detallados ya vienen desde el frontend
    // Solo usamos los que nos pasan en garmentDescription y personDescription
    const detailedGarmentDesc = garmentDescription || 'prenda elegante de alta calidad';
    const detailedPersonDesc = personDescription || 'persona con características únicas';

    const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }> = [
      {
        type: 'text',
        text: 'Initial prompt' // Se actualizará en generateWithRetry
      }
    ];

    if (sanitizedModelImage) {
      content.push({ type: 'image', image: `data:image/png;base64,${sanitizedModelImage}` });
    }

    if (garmentImage) {
      content.push({ type: 'image', image: `data:image/png;base64,${garmentImage}` });
    }

    console.log('Content parts:', content.length);

    const file = await generateWithRetry(content, mode, detailedGarmentDesc, detailedPersonDesc);

    if (file) {
      console.log('===IMAGEN GENERADA EXITOSAMENTE ===');
      console.log('File received from AI SDK');

      // Retornar el file generado directamente
      // El AI SDK retorna el archivo en el formato correcto
      return NextResponse.json({
        image: file,
        sanitizedModelImage: sanitizedModelImage ? `data:image/png;base64,${sanitizedModelImage}` : null
      });
    }

    return NextResponse.json({
      image: null,
      error: 'No files generated after all retries'
    });
  } catch (error) {
    console.error('=== ERROR FINAL ===', error);
    return NextResponse.json(
      { error: 'Error generating image' },
      { status: 500 }
    );
  }
}
