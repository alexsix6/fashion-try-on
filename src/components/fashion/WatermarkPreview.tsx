'use client'

import { useState } from 'react';
import { previewWatermark } from '@/lib/watermark';

interface WatermarkPreviewProps {
  className?: string;
}

export function WatermarkPreview({ className = '' }: WatermarkPreviewProps) {
  const [style, setStyle] = useState<'minimal' | 'full' | 'isotipo'>('full');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  const watermarkSVG = previewWatermark(style, size);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Vista Previa de Marca de Agua
      </h3>
      
      {/* Controles */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estilo
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#7C2632] focus:border-[#7C2632]"
          >
            <option value="isotipo">Solo Logo</option>
            <option value="minimal">Solo Texto</option>
            <option value="full">Logo + Texto</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamaño
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#7C2632] focus:border-[#7C2632]"
          >
            <option value="small">Pequeño</option>
            <option value="medium">Mediano</option>
            <option value="large">Grande</option>
          </select>
        </div>
      </div>

      {/* Vista Previa */}
      <div className="space-y-4">
        {/* Fondo Claro */}
        <div className="bg-gradient-to-r from-[#F7F4EC] to-[#F2D9D3] p-8 rounded-lg relative">
          <div className="text-sm text-gray-600 mb-2">Sobre fondo claro:</div>
          <div 
            className="absolute bottom-4 right-4"
            dangerouslySetInnerHTML={{ __html: watermarkSVG }}
          />
          <div className="h-20"></div>
        </div>

        {/* Fondo Oscuro */}
        <div className="bg-gradient-to-r from-[#0E3B2E] to-[#222831] p-8 rounded-lg relative">
          <div className="text-sm text-[#F7F4EC] mb-2">Sobre fondo oscuro:</div>
          <div 
            className="absolute bottom-4 right-4"
            dangerouslySetInnerHTML={{ __html: watermarkSVG }}
          />
          <div className="h-20"></div>
        </div>

        {/* Fondo con Imagen */}
        <div className="bg-gradient-to-br from-[#7C2632] via-[#F2D9D3] to-[#0E3B2E] p-8 rounded-lg relative">
          <div className="text-sm text-white mb-2">Sobre fondo mixto:</div>
          <div 
            className="absolute bottom-4 right-4"
            dangerouslySetInnerHTML={{ __html: watermarkSVG }}
          />
          <div className="h-20"></div>
        </div>
      </div>

      {/* Información */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Aplicación Automática:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Catálogo:</strong> Marca completa (logo + texto) en esquina inferior derecha</li>
          <li>• <strong>Try-on personal:</strong> Solo logo discreto para proteger privacidad</li>
          <li>• <strong>Detección inteligente:</strong> Color se adapta automáticamente al fondo</li>
          <li>• <strong>Opacidad optimizada:</strong> Visible pero no intrusiva</li>
        </ul>
      </div>

      {/* Información sobre distorsión */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">⚠️ Sobre la Calidad de Imagen:</h4>
        <p className="text-sm text-yellow-700 mb-2">
          Las imágenes pueden verse "pixeladas" debido al <strong>sanitizador</strong> que previene errores de contenido prohibido.
        </p>
        <p className="text-sm text-yellow-700">
          <strong>Opciones:</strong> Calidad reducida pero más estable vs. Calidad alta con riesgo de bloqueos.
        </p>
      </div>
    </div>
  );
}
