/**
 * Sistema de marca de agua inteligente para Vintage de Liz
 * Analiza el fondo de la imagen y aplica el color apropiado
 */

// Colores de la marca Vintage de Liz
const BRAND_COLORS = {
  wine: '#7C2632',      // Vino tinto - para fondos claros
  bottle: '#0E3B2E',    // Verde botella - para fondos claros
  cream: '#F7F4EC',     // Marfil - para fondos oscuros
  rose: '#F2D9D3',      // Rosa viejo - para fondos oscuros
  ink: '#111111',       // Carbón - para fondos muy claros
  slate: '#222831'      // Pizarra - para fondos claros
};

interface WatermarkOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
  style?: 'minimal' | 'full' | 'isotipo';
}

/**
 * Analiza la luminosidad promedio de una región de la imagen
 */
function analyzeImageBrightness(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number): number {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  
  let totalBrightness = 0;
  let pixelCount = 0;
  
  // Analizar cada píxel en la región
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    // Solo contar píxeles no transparentes
    if (alpha > 128) {
      // Fórmula de luminosidad perceptual
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
      totalBrightness += brightness;
      pixelCount++;
    }
  }
  
  return pixelCount > 0 ? totalBrightness / pixelCount : 128;
}

/**
 * Determina el color de marca de agua basado en el fondo
 */
function getWatermarkColor(brightness: number): { color: string; shadow: boolean } {
  if (brightness < 80) {
    // Fondo oscuro - usar colores claros
    return {
      color: BRAND_COLORS.cream,
      shadow: false
    };
  } else if (brightness > 180) {
    // Fondo muy claro - usar colores oscuros con sombra
    return {
      color: BRAND_COLORS.ink,
      shadow: true
    };
  } else {
    // Fondo medio - usar color principal con sombra
    return {
      color: BRAND_COLORS.wine,
      shadow: true
    };
  }
}

/**
 * Genera el SVG de la marca de agua según el estilo
 */
function generateWatermarkSVG(
  color: string, 
  shadow: boolean, 
  style: 'minimal' | 'full' | 'isotipo', 
  size: 'small' | 'medium' | 'large'
): string {
  const sizes = {
    small: { width: 120, height: 40, fontSize: 12 },
    medium: { width: 180, height: 60, fontSize: 16 },
    large: { width: 240, height: 80, fontSize: 20 }
  };
  
  const { width, height, fontSize } = sizes[size];
  
  const shadowFilter = shadow ? `
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    </defs>
  ` : '';
  
  const filterAttr = shadow ? 'filter="url(#shadow)"' : '';
  
  if (style === 'isotipo') {
    // Solo el isotipo (etiqueta)
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${shadowFilter}
        <g ${filterAttr}>
          <path d="M10,15 q5,-8 15,-8 h40 q10,0 15,8 v25 q0,9 -8,14 l-15,10 q-8,5 -15,0 l-15,-10 q-8,-5 -8,-14 z" fill="${color}" opacity="0.8"/>
          <circle cx="20" cy="20" r="2" fill="white" opacity="0.9"/>
          <text x="40" y="30" text-anchor="middle" font-size="${fontSize * 0.8}" font-weight="700" fill="white" font-family="system-ui">V</text>
          <text x="40" y="42" text-anchor="middle" font-size="${fontSize * 0.4}" font-weight="600" fill="white" font-family="system-ui">LIZ</text>
        </g>
      </svg>
    `;
  } else if (style === 'minimal') {
    // Solo texto
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${shadowFilter}
        <g ${filterAttr}>
          <text x="${width/2}" y="${height/2 + fontSize/3}" text-anchor="middle" font-size="${fontSize}" font-weight="600" fill="${color}" font-family="system-ui" opacity="0.7">VINTAGE DE LIZ</text>
        </g>
      </svg>
    `;
  } else {
    // Full: isotipo + texto
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${shadowFilter}
        <g ${filterAttr}>
          <!-- Isotipo -->
          <path d="M5,10 q3,-5 8,-5 h20 q5,0 8,5 v15 q0,5 -4,8 l-8,5 q-4,3 -8,0 l-8,-5 q-4,-3 -4,-8 z" fill="${color}" opacity="0.8"/>
          <circle cx="12" cy="13" r="1.5" fill="white" opacity="0.9"/>
          <text x="20" y="20" text-anchor="middle" font-size="${fontSize * 0.6}" font-weight="700" fill="white" font-family="system-ui">V</text>
          <text x="20" y="27" text-anchor="middle" font-size="${fontSize * 0.3}" font-weight="600" fill="white" font-family="system-ui">LIZ</text>
          
          <!-- Texto -->
          <text x="50" y="${height/2 + fontSize/3}" font-size="${fontSize}" font-weight="600" fill="${color}" font-family="system-ui" opacity="0.7">VINTAGE DE LIZ</text>
        </g>
      </svg>
    `;
  }
}

/**
 * Calcula la posición de la marca de agua
 */
function getWatermarkPosition(
  canvasWidth: number, 
  canvasHeight: number, 
  watermarkWidth: number, 
  watermarkHeight: number, 
  position: string
): { x: number; y: number } {
  const margin = 20;
  
  switch (position) {
    case 'bottom-right':
      return {
        x: canvasWidth - watermarkWidth - margin,
        y: canvasHeight - watermarkHeight - margin
      };
    case 'bottom-left':
      return {
        x: margin,
        y: canvasHeight - watermarkHeight - margin
      };
    case 'top-right':
      return {
        x: canvasWidth - watermarkWidth - margin,
        y: margin
      };
    case 'top-left':
      return {
        x: margin,
        y: margin
      };
    case 'center':
      return {
        x: (canvasWidth - watermarkWidth) / 2,
        y: (canvasHeight - watermarkHeight) / 2
      };
    default:
      return {
        x: canvasWidth - watermarkWidth - margin,
        y: canvasHeight - watermarkHeight - margin
      };
  }
}

/**
 * Aplica marca de agua inteligente a una imagen base64
 */
export async function applyIntelligentWatermark(
  base64Image: string,
  options: WatermarkOptions = {}
): Promise<string> {
  const {
    position = 'bottom-right',
    opacity = 0.7,
    size = 'medium',
    style = 'full'
  } = options;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Crear canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar imagen original
        ctx.drawImage(img, 0, 0);
        
        // Determinar posición de la marca de agua
        const sizes = {
          small: { width: 120, height: 40 },
          medium: { width: 180, height: 60 },
          large: { width: 240, height: 80 }
        };
        
        const watermarkSize = sizes[size];
        const pos = getWatermarkPosition(
          canvas.width, 
          canvas.height, 
          watermarkSize.width, 
          watermarkSize.height, 
          position
        );
        
        // Analizar brillo en la región donde se colocará la marca de agua
        const brightness = analyzeImageBrightness(
          canvas, 
          pos.x, 
          pos.y, 
          watermarkSize.width, 
          watermarkSize.height
        );
        
        // Obtener color apropiado
        const { color, shadow } = getWatermarkColor(brightness);
        
        // Generar SVG de marca de agua
        const watermarkSVG = generateWatermarkSVG(color, shadow, style, size);
        
        // Convertir SVG a imagen
        const svgBlob = new Blob([watermarkSVG], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const watermarkImg = new Image();
        watermarkImg.onload = () => {
          // Aplicar marca de agua con opacidad
          ctx.globalAlpha = opacity;
          ctx.drawImage(
            watermarkImg, 
            pos.x, 
            pos.y, 
            watermarkSize.width, 
            watermarkSize.height
          );
          
          // Restaurar opacidad
          ctx.globalAlpha = 1.0;
          
          // Convertir a base64
          const result = canvas.toDataURL('image/png', 0.95);
          const base64Data = result.split(',')[1];
          
          // Limpiar recursos
          URL.revokeObjectURL(svgUrl);
          
          resolve(base64Data);
        };
        
        watermarkImg.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Error loading watermark SVG'));
        };
        
        watermarkImg.src = svgUrl;
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Error loading base image'));
    };
    
    img.src = `data:image/png;base64,${base64Image}`;
  });
}

/**
 * Aplica marca de agua a múltiples imágenes
 */
export async function applyWatermarkBatch(
  images: string[],
  options: WatermarkOptions = {}
): Promise<string[]> {
  const promises = images.map(image => applyIntelligentWatermark(image, options));
  return Promise.all(promises);
}

/**
 * Vista previa de cómo se verá la marca de agua
 */
export function previewWatermark(
  style: 'minimal' | 'full' | 'isotipo' = 'full',
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  return generateWatermarkSVG(BRAND_COLORS.wine, true, style, size);
}




