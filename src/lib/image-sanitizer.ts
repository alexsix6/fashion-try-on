// Import sharp only when needed to avoid Vercel build errors
// import sharp from 'sharp';

/**
 * Aplica un filtro suave para estilizar la imagen del modelo antes de enviarla a Gemini.
 * Reduce rasgos faciales detallados y produce una apariencia ilustrada, preservando la prenda.
 *
 * NOTA: Sanitización actualmente DESHABILITADA - retorna imagen original
 */
export async function sanitizeModelImage(base64Image?: string): Promise<string | undefined> {
  if (!base64Image) {
    return undefined;
  }

  // SANITIZACIÓN DESHABILITADA - retorna imagen original sin procesamiento
  // Para habilitar: descomentar import sharp arriba y restaurar código de sanitización
  return base64Image;
}
