import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * Analiza una imagen de prenda para extraer características específicas
 * que mejoren la precisión en la generación
 */
export async function analyzeGarmentImage(base64Image: string): Promise<string> {
  try {
    const analysisPrompt = `Eres un experto en análisis de prendas de vestir. Analiza esta imagen de prenda y describe EXACTAMENTE:

CARACTERÍSTICAS FÍSICAS:
- Color exacto (tono, saturación, matices)
- Tipo de tejido y textura visible
- Corte y silueta específica
- Longitud exacta (mangas, falda, etc.)
- Detalles específicos: botones, cremalleras, costuras, bolsillos
- Patrones o estampados si los hay
- Acabados y bordes

CARACTERÍSTICAS DE DISEÑO:
- Estilo específico (casual, formal, deportivo)
- Forma del cuello, escote, cintura
- Ajuste (holgado, entallado, oversize)
- Elementos decorativos únicos

RESPUESTA:
Describe la prenda en máximo 100 palabras, siendo MUY específico en colores, texturas y detalles únicos que la hacen identificable.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image', image: `data:image/png;base64,${base64Image}` }
          ]
        }
      ],
      temperature: 0.3 // Baja temperatura para mayor precisión
    });

    return text.trim();
  } catch (error) {
    console.error('Error analyzing garment image:', error);
    return 'Prenda de alta calidad con características específicas y detalles únicos';
  }
}

/**
 * Analiza una imagen de persona para extraer características específicas
 * que mejoren la precisión en el try-on
 */
export async function analyzePersonImage(base64Image: string): Promise<string> {
  try {
    const analysisPrompt = `Eres un experto en análisis de características físicas para try-on virtual. Analiza esta imagen de persona y describe EXACTAMENTE:

CARACTERÍSTICAS FÍSICAS:
- Tono de piel específico
- Color, textura y estilo del cabello
- Forma y características faciales únicas
- Complexión y proporciones corporales
- Postura y pose específica
- Estilo personal visible

CARACTERÍSTICAS ÚNICAS:
- Rasgos distintivos que la identifican
- Proporciones corporales específicas
- Elementos que deben preservarse

RESPUESTA:
Describe a la persona en máximo 80 palabras, siendo MUY específico en características que la hacen única e identificable para un try-on preciso.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image', image: `data:image/png;base64,${base64Image}` }
          ]
        }
      ],
      temperature: 0.3 // Baja temperatura para mayor precisión
    });

    return text.trim();
  } catch (error) {
    console.error('Error analyzing person image:', error);
    return 'Persona con características únicas, rasgos distintivos y proporciones específicas';
  }
}

/**
 * Extrae colores dominantes de una imagen usando análisis de IA
 */
export async function extractDominantColors(base64Image: string): Promise<string[]> {
  try {
    const colorPrompt = `Analiza esta imagen y identifica los 3 colores más dominantes. 
    
Responde SOLO con los nombres de los colores en español, separados por comas.
Ejemplos: "azul marino, blanco, gris", "rojo, negro, dorado"

Sé específico con los tonos (ej: "azul marino" no solo "azul").`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: colorPrompt },
            { type: 'image', image: `data:image/png;base64,${base64Image}` }
          ]
        }
      ],
      temperature: 0.2
    });

    return text.split(',').map(color => color.trim()).slice(0, 3);
  } catch (error) {
    console.error('Error extracting colors:', error);
    return ['color específico'];
  }
}




