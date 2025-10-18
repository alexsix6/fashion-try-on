export const FASHION_PROMPTS = {
    // Equivale al INITIAL_STORY - Para crear catálogo inicial
    CREATE_CATALOG: `Analiza las imágenes proporcionadas y crea una descripción profesional de catálogo de moda.

Describe la prenda y cómo se vería en el modelo mostrado. Enfócate en:
- Características de la prenda (color, estilo, corte)
- Cómo luce en el modelo
- Descripción comercial atractiva

Mantén la respuesta en 2 párrafos cortos y profesionales.

Al final, incluye una línea que comience con "IMAGEN:" seguida de una descripción breve en español para generar la imagen (máximo 40 palabras).`,
  
    // Para personalización de clientes
    CUSTOMER_PERSONALIZATION: `Eres un asistente de try-on virtual personalizado. El cliente quiere ver cómo le quedaría una prenda específica del catálogo. 
  
  Mantén todos los detalles exactos de la prenda pero aplícala al cliente. Describe el resultado de manera positiva, realista y alentadora, máximo 2 párrafos cortos.
  
  Termina invitando al cliente a probar otras prendas del catálogo.
  
  IMPORTANTE: Al final, SIEMPRE incluye una línea separada que comience EXACTAMENTE con "IMAGEN:" seguida de una descripción breve en español del cliente usando exactamente esa prenda (máximo 50 palabras). Esta línea es OBLIGATORIA.`,
  
    // Equivale al CONTINUE_STORY - Para continuar cualquier conversación
    CONTINUE_CONVERSATION: (historyText: string, userMessage: string) => {
      return `Eres un asistente de moda virtual especializado en try-on de vestimentas y catálogos.
  
  Historial de la conversación:
  ${historyText}
  
  Nuevo mensaje del usuario: ${userMessage}
  
  Continúa la conversación basándote en la acción del usuario. Responde profesionalmente sobre moda y styling. Si solicita cambios o nuevas combinaciones, describe las consecuencias de manera clara e inmersiva en MÁXIMO 2 párrafos cortos.
  
  Sé conciso y directo. Presenta la nueva situación y termina SIEMPRE invitando al usuario a participar activamente preguntándole qué quiere hacer, dónde quiere ir, qué observa, o qué acción tomar.
  
  IMPORTANTE: Al final, SIEMPRE incluye una línea separada que comience EXACTAMENTE con "IMAGEN:" seguida de una descripción breve en español para generar imagen del styling sugerido (máximo 50 palabras). Esta línea es OBLIGATORIA.`;
    },
  
    // Para generar imágenes - Recibe español, envía inglés a Nano Banana
    GENERATE_IMAGE: (descriptionInSpanish: string) => {
      return `Create a professional fashion editorial composition combining visual elements from the provided references.

COMPOSITION REQUIREMENTS:
- Fashion editorial photography style
- Professional catalog presentation
- Garment styling and visual arrangement
- High-end fashion photography aesthetic
- Studio lighting and professional setup
- Commercial fashion catalog quality

VISUAL STYLE:
- Sophisticated fashion editorial
- Clean, professional composition
- Focus on garment details and textures
- Commercial photography standards
- Magazine-quality presentation
- Fashion catalog aesthetic

TECHNICAL SPECIFICATIONS:
- Professional fashion photography
- Commercial catalog standards
- High-quality visual composition
- Editorial fashion styling

Context: ${descriptionInSpanish}

Generate a professional fashion editorial composition suitable for commercial catalog use.`;
    },

    // Nuevo: Prompt específico para MODO DUEÑO (máxima fidelidad de prenda)
    GENERATE_CATALOG_IMAGE: (garmentDescription: string) => {
      return `Create a professional fashion catalog photograph combining the two reference images.

COMPOSITION:
- The person/model from the FIRST reference image
- WEARING the garment/clothing from the SECOND reference image
- Professional fashion photography style
- Studio quality lighting and presentation

GARMENT ACCURACY (from second reference):
- Exact colors, patterns, and design
- Exact fabric texture and material
- Exact cut, fit, and silhouette
- Exact details: buttons, seams, neckline, sleeves
- Natural draping on the model's body

OUTPUT: Fashion catalog photo showing the model wearing the garment.

Context: ${garmentDescription}`;
    },

    // Nuevo: Prompt específico para MODO CLIENTE (fidelidad persona + prenda)
    GENERATE_TRYON_IMAGE: (personDescription: string, garmentDescription: string) => {
      return `CRITICAL PERSON IDENTITY PRESERVATION + GARMENT REPLACEMENT TASK:

🚨 ABSOLUTE PERSON IDENTITY RULES:
- EXACT same person from reference photo
- IDENTICAL facial features, expressions, bone structure
- IDENTICAL skin tone, complexion, and skin texture
- IDENTICAL hair: color, style, length, texture
- IDENTICAL eye color, nose, mouth, facial proportions
- IDENTICAL body build, height, proportions
- IDENTICAL unique characteristics and features
- SAME person wearing different clothes - NOT a different person

🔄 GARMENT REPLACEMENT ON THIS EXACT PERSON:
- REMOVE all original clothing from this specific person
- REPLACE with ONLY the catalog garment
- Fit the garment naturally to THIS person's exact body
- Maintain THIS person's pose and positioning
- Ensure garment fits THIS person's specific build

🎯 EXACT GARMENT REPLICATION ON THIS PERSON:
- EXACT color match from garment reference
- EXACT fabric texture and material appearance
- EXACT cut adapted to this person's body shape
- EXACT details: buttons, seams, patterns, prints
- Natural draping on this person's specific build

🔍 IDENTITY VERIFICATION PROCESS:
- Use the person reference as the PRIMARY template
- This person's identity is NON-NEGOTIABLE
- Apply garment to THIS exact person only
- Verify facial features match reference exactly
- Ensure body proportions match reference exactly

Context Person (MUST PRESERVE): ${personDescription}
Context Garment (MUST APPLY): ${garmentDescription}

🚨 CRITICAL: Same exact person + new garment. Person identity is ABSOLUTE PRIORITY.`;
    }
  };