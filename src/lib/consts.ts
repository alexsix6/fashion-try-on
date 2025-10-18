export const UI_MESSAGES = {
    LOADING: {
      CATALOG: 'Generando imagen de catálogo...',
      TRYON: 'Aplicando prenda al cliente...',
      IMAGE: 'Generando imagen...'
    },
    ERROR: {
      CATALOG_GENERATION: 'Error al generar imagen de catálogo',
      TRYON_GENERATION: 'Error al aplicar prenda al cliente', 
      IMAGE_GENERATION: 'Error al generar imagen',
      MISSING_PROMPT: 'Falta información para procesar la solicitud',
      UPLOAD_REQUIRED: 'Debes subir tanto la imagen del modelo como de la prenda',
      LOGIN_REQUIRED: 'Debes iniciar sesión para usar la personalización'
    },
    PLACEHOLDERS: {
      CATALOG_INPUT: 'Describe la prenda o modelo, agrega detalles específicos...',
      CUSTOMER_INPUT: 'Describe cómo te gustaría que se vea, ajustes específicos...'
    },
    SUCCESS: {
      CATALOG_CREATED: 'Imagen de catálogo creada exitosamente',
      TRYON_COMPLETED: 'Personalización completada'
    }
  };
  
  export const FASHION_CONFIG = {
    IMAGE: {
      DEFAULT_PROMPT: 'professional fashion photography, high quality, realistic',
      SEPARATOR: 'IMAGEN:'
    },
    // Tipos de prendas para recomendaciones
    GARMENT_TYPES: {
      TOPS: ['camiseta', 'blusa', 'suéter', 'chaqueta', 'camisa'],
      BOTTOMS: ['pantalón', 'falda', 'shorts', 'jeans'],
      DRESSES: ['vestido', 'mono'],
      ACCESSORIES: ['sombrero', 'collar', 'pulsera', 'bolso']
    },
    // Recomendaciones para mejores resultados
    RECOMMENDATIONS: {
      MANGA_CORTA: 'Para mejores resultados, usa una foto con manga corta similar',
      MANGA_LARGA: 'Para mejores resultados, usa una foto con manga larga similar', 
      ESCOTE: 'Para mejores resultados, usa una foto con escote similar',
      SUETER: 'Para mejores resultados, usa una foto con suéter o prenda similar',
      VESTIDO: 'Para mejores resultados, usa una foto con vestido o prenda similar'
    }
  };
  
  // Función de traducción básica español→inglés para Nano Banana
  export const translateToEnglish = (spanishText: string | undefined): string => {
    // Manejar casos undefined o null
    if (!spanishText || typeof spanishText !== 'string') {
      return 'professional fashion model wearing elegant clothing';
    }

    const translations: Record<string, string> = {
      // Prendas
      'camiseta': 't-shirt',
      'blusa': 'blouse', 
      'suéter': 'sweater',
      'chaqueta': 'jacket',
      'pantalón': 'pants',
      'falda': 'skirt',
      'vestido': 'dress',
      'jeans': 'jeans',
      'camisa': 'shirt',
    
      // Colores
      'rojo': 'red',
      'azul': 'blue', 
      'verde': 'green',
      'negro': 'black',
      'blanco': 'white',
      'gris': 'gray',
      'rosa': 'pink',
      'amarillo': 'yellow',
    
      // Descriptivos
      'modelo': 'model',
      'profesional': 'professional',
      'elegante': 'elegant',
      'casual': 'casual',
      'moderno': 'modern',
      'clásico': 'classic',
      'ajustado': 'fitted',
      'holgado': 'loose'
    };

    let translatedText = spanishText.toLowerCase();
  
    // Reemplazar palabras conocidas
    Object.entries(translations).forEach(([spanish, english]) => {
      const regex = new RegExp(`\\b${spanish}\\b`, 'gi');
      translatedText = translatedText.replace(regex, english);
    });

    return translatedText;
  };