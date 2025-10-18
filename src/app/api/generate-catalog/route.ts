import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from 'next/server';
import { FASHION_PROMPTS } from '@/lib/prompts';
import { FASHION_CONFIG } from '@/lib/consts';
import { GenerateFashionRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory, isStart, mode, generatedImage }: GenerateFashionRequest = await request.json();

    console.log('API called with mode:', mode, 'isStart:', isStart, 'hasImage:', !!generatedImage);

    let prompt: string;
    
    if (mode === 'catalog' && isStart && generatedImage) {
      // NUEVO FLUJO: Analizar imagen ya generada por Nano Banana
      prompt = `Eres un experto en moda y catálogos profesionales. Analiza la imagen generada que muestra un modelo portando una prenda específica.

INSTRUCCIONES:
- Observa cuidadosamente la imagen generada
- Describe la prenda y cómo se ve en el modelo
- Crea una descripción comercial profesional
- Enfoque atractivo para venta
- Máximo 2 párrafos cortos

FORMATO:
Describe lo que ves en la imagen de manera profesional y comercial. NO incluyas "IMAGEN:" al final ya que la imagen ya fue generada.`;

      // Preparar contenido con imagen generada
      const content = [
        { type: 'text' as const, text: prompt },
        { 
          type: 'image' as const, 
          image: `data:image/png;base64,${generatedImage}`
        }
      ];

      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        messages: [
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.7
      });

      console.log('Generated description from image:', text.substring(0, 100) + '...');

      return NextResponse.json({ 
        story: text.trim(),
        imagePrompt: '' // No necesario, imagen ya generada
      });

    } else if (mode === 'catalog' && isStart) {
      // Fallback: descripción genérica si no hay imagen
      const story = 'Esta elegante prenda combina estilo y sofisticación, perfecta para cualquier ocasión especial. Su diseño cuidadosamente elaborado refleja las últimas tendencias de la moda contemporánea.';
      
      return NextResponse.json({ 
        story,
        imagePrompt: ''
      });

    } else {
      // Modo conversación normal
      const historyText = conversationHistory.map(
        (message) => `${message.role}: ${message.content}`
      ).join('\n');
      prompt = FASHION_PROMPTS.CONTINUE_CONVERSATION(historyText, userMessage);

      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: prompt
      });

      return NextResponse.json({ 
        story: text,
        imagePrompt: ''
      });
    }

  } catch (error) {
    console.error('Error generating catalog:', error);
    
    // Fallback robusto
    return NextResponse.json({ 
      story: 'Esta elegante prenda combina estilo y sofisticación, perfecta para cualquier ocasión especial. Su diseño cuidadosamente elaborado refleja las últimas tendencias de la moda contemporánea.',
      imagePrompt: ''
    });
  }
}