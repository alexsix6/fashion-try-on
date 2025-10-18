'use client'

import { useFashionApp } from '@/hooks/useFashionApp';
import { CatalogItem } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';
import TabsNavigator from '@/components/ui/TabsNavigator';
import { LiquidButton } from '@/components/ui/liquid-button';
import { MediaDashboard } from './MediaDashboard';
import { Upload, Palette, Users, Sparkles, Download, RefreshCw, X, Trash2 } from 'lucide-react';

export function FashionApp() {
  const {
    mode,
    stage,
    isLoading,
    error,
    uploadedImages,
    generatedCatalog,
    generatedImage,
    messages,
    inputValue,
    isInputDisabled,
    catalog,
    selectedCatalogItem,
    catalogCount,
    favorites,
    uploadedGarments,
    setMode,
    uploadImage,
    removeImage,
    clearImages,
    generateCatalog,
    generateTryOn,
    regenerateImage,
    sendMessage,
    setInputValue,
    clearError,
    resetApp,
    selectCatalogItem,
    removeCatalogItem,
    clearCatalog,
    downloadImage,
    toggleFavorite,
    viewDescription,
  } = useFashionApp();

  // SOLO MODO DUEÑO ACTIVO - Modo cliente mantenido en código pero oculto
  // const modeTabs = [
  //   {
  //     id: 'owner',
  //     label: 'Crear Catálogo',
  //     icon: <Palette className="w-4 h-4" />,
  //     color: 'from-purple-600 to-pink-600'
  //   },
  //   {
  //     id: 'customer',
  //     label: 'Try-On Virtual',
  //     icon: <Users className="w-4 h-4" />,
  //     color: 'from-green-600 to-emerald-600'
  //   }
  // ];

  return (
    <div className="space-y-8">
      {/* Título principal sin tabs - Solo modo catálogo */}
      <GlassCard className="purple-glow">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Generador de Catálogo</h1>
          <span className="text-sm text-purple-300 ml-auto">Vintage de Liz</span>
        </div>
      </GlassCard>

      {/* Main Content - Single Column */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Upload Section */}
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400"/>
            Subir Imágenes (Modelo + Prenda)
          </h2>
          
          <div className="space-y-4">
            <UploadArea title="Foto del Modelo" type="model" onUpload={uploadImage} uploaded={uploadedImages.find(img => img.type === 'model')} onRemove={removeImage} />
            <UploadArea title="Foto de la Prenda" type="garment" onUpload={uploadImage} uploaded={uploadedImages.find(img => img.type === 'garment')} onRemove={removeImage} />
          </div>
          
          <div className="mt-6 flex gap-4">
            {uploadedImages.length >= 2 && (
              <LiquidButton onClick={() => generateCatalog()} disabled={isLoading} variant="space" size="lg" className="flex-1">
                <Sparkles className="w-5 h-5" />
                {isLoading ? 'Generando...' : 'Generar Catálogo'}
              </LiquidButton>
            )}
            {uploadedImages.length > 0 && (
              <LiquidButton onClick={clearImages} variant="destructive" size="lg">
                <Trash2 className="w-5 h-5" />
                Limpiar
              </LiquidButton>
            )}
          </div>

          {/* Loading indicator dentro del card */}
          {isLoading && (
            <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-3"></div>
                <span className="text-blue-200">
                  {stage === 'uploading' && 'Subiendo imagen...'}
                  {stage === 'generating-catalog' && 'Generando descripción...'}
                  {stage === 'generating-image' && 'Creando imagen con IA...'}
                </span>
              </div>
            </div>
          )}

          {/* Error indicator dentro del card */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-red-200">{error}</span>
                <button onClick={clearError} className="text-red-300 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Conversación con IA - Opcional */}
        <GlassCard variant="dark">
          <h3 className="text-lg font-semibold text-white mb-4">Conversación con IA</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isInputDisabled}
              placeholder="Describe qué quieres hacer..."
              className="flex-1 px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              onKeyPress={(e) => { if (e.key === 'Enter' && inputValue.trim()) { sendMessage(inputValue.trim()); } }}
            />
            <LiquidButton
              onClick={() => inputValue.trim() && sendMessage(inputValue.trim())}
              disabled={!inputValue.trim() || isInputDisabled}
              variant="space"
              size="lg"
            >
              Enviar
            </LiquidButton>
          </div>
        </GlassCard>
      </div>

      {/* Media Dashboard con paginación */}
      <MediaDashboard
        catalog={catalog}
        favorites={favorites}
        uploadedGarments={uploadedGarments}
        onDownload={downloadImage}
        onRemove={removeCatalogItem}
        onClear={clearCatalog}
        onToggleFavorite={toggleFavorite}
        onViewDescription={viewDescription}
      />
    </div>
  );
}

interface UploadAreaProps {
  title: string;
  type: 'model' | 'garment' | 'customer';
  onUpload: (file: File, type: 'model' | 'garment' | 'customer') => void;
  uploaded?: { id: string; preview: string; type: string };
  onRemove: (id: string) => void;
}

function UploadArea({ title, type, onUpload, uploaded, onRemove }: UploadAreaProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) { onUpload(file, type); }
  };

  return (
    <div className="border-2 border-dashed border-zinc-600 rounded-lg p-4 hover:border-purple-500 transition-colors">
      <h4 className="text-sm font-semibold text-zinc-300 mb-2">{title}</h4>
      {uploaded ? (
        <div className="relative">
          <img src={uploaded.preview} alt={title} className="w-full h-32 object-cover rounded-lg" />
          <button onClick={() => onRemove(uploaded.id)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors">✕</button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="flex flex-col items-center justify-center h-32 text-zinc-500 hover:text-purple-400 transition-colors">
            <div className="text-3xl mb-2">📁</div>
            <span className="text-sm">Click para subir imagen</span>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      )}
    </div>
  );
}