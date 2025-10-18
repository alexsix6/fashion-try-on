import sharp from 'sharp';

/**
 * Aplica un filtro suave para estilizar la imagen del modelo antes de enviarla a Gemini.
 * Reduce rasgos faciales detallados y produce una apariencia ilustrada, preservando la prenda.
 */
export async function sanitizeModelImage(base64Image?: string): Promise<string | undefined> {
  if (!base64Image) {
    return undefined;
  }

  // TEMPORAL: Desactivar sanitización para pruebas
  return base64Image;

  // Unreachable code below - kept for future use when sanitization is re-enabled
  // Using non-null assertion since we've already checked for undefined above
  try {
    const buffer = Buffer.from(base64Image!, 'base64');

    const baseSharp = sharp(buffer, { failOn: 'none' });
    const metadata = await baseSharp.metadata();

    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const reference = Math.max(width, height);
    const blurSigma = Math.min(Math.max(reference / 550, 1.2), 4.5);

    const softenedBuffer = await baseSharp
      .clone()
      .blur(Math.min(blurSigma, 2.0)) // Reducir blur máximo
      .median(2) // Reducir efecto median (era 3)
      .modulate({ saturation: 0.95, brightness: 1.04 }) // Menos modificación
      .linear(1.02, -6) // Menos contraste
      .toBuffer();

    const edgesBuffer = await baseSharp
      .clone()
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0]
      })
      .linear(2.2)
      .gamma(1.1)
      .toBuffer();

        const sanitizedBuffer = await sharp(softenedBuffer)
          .composite([
            {
              input: edgesBuffer,
              blend: 'overlay'
              // Note: opacity removed - not supported in Sharp OverlayOptions
              // Reduced from 0.45 to 0.25 in original code
            }
          ])
          .png({ palette: true, colors: 128 }) // Más colores (era 64)
          .toBuffer();

    return sanitizedBuffer.toString('base64');
  } catch (error) {
    console.warn('sanitizeModelImage: fallback to original image due to error', error);
    return base64Image;
  }
}
