import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from 'next/server';

export interface ChatCatalogRequest {
  userMessage: string;
  catalogItems: Array<{
    id: string;
    title: string;
    description: string;
    metadata?: {
      garmentType: string;
      colors: string[];
      style: string;
      gender: string;
      season: string;
      occasion: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, catalogItems }: ChatCatalogRequest = await request.json();

    // Crear resumen del catálogo para la IA
    const catalogSummary = catalogItems.map(item => {
      const meta = item.metadata;
      return `ID: ${item.id}
Título: ${item.title}
Tipo: ${meta?.garmentType || 'no especificado'}
Colores: ${meta?.colors?.join(', ') || 'no especificado'}
Estilo: ${meta?.style || 'no especificado'}
Género: ${meta?.gender || 'no especificado'}
Ocasión: ${meta?.occasion || 'no especificado'}
Descripción: ${item.description.substring(0, 100)}...`;
    }).join('\n\n');

    const prompt = `Eres un asistente de moda inteligente que ayuda a filtrar y buscar prendas en un catálogo.

CATÁLOGO DISPONIBLE:
${catalogSummary}

CONSULTA DEL USUARIO: "${userMessage}"

INSTRUCCIONES:
- Analiza la consulta del usuario
- Encuentra las prendas que coincidan con lo solicitado
- Si pide filtros específicos (color, tipo, estilo, género, ocasión), úsalos
- Responde de forma conversacional y útil
- Si encuentras prendas, menciona sus IDs y características relevantes
- Si no encuentras nada específico, sugiere alternativas similares

EJEMPLOS DE CONSULTAS:
- "Muestra todas las prendas formales"
- "¿Tienes vestidos verdes?"
- "Ropa casual para mujer"
- "Prendas para fiesta de noche"

Responde de forma natural y conversacional.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt
    });

    // Extraer IDs mencionados en la respuesta para destacar prendas
    const mentionedIds = catalogItems
      .map(item => item.id)
      .filter(id => text.toLowerCase().includes(id.toLowerCase()));

    return NextResponse.json({ 
      response: text,
      highlightedIds: mentionedIds
    });

  } catch (error) {
    console.error('Error in chat catalog:', error);
    return NextResponse.json(
      { error: 'Error processing chat request' }, 
      { status: 500 }
    );
  }
}












