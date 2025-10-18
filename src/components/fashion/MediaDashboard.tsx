'use client'

import { useState } from 'react';
import { CatalogItem } from '@/lib/types';
import { Download, Trash2, ChevronLeft, ChevronRight, Heart, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/liquid-button';

interface MediaDashboardProps {
  catalog: CatalogItem[];
  favorites: string[]; // Array de IDs de favoritos
  uploadedGarments: Array<{ id: string; image: string; name: string }>; // Prendas originales
  onDownload: (item: CatalogItem) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  onToggleFavorite: (itemId: string) => void;
  onViewDescription: (item: CatalogItem) => void;
  onRegenerateWithAI: (item: CatalogItem, instructions: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 12; // 4 columnas x 3 filas

export function MediaDashboard({
  catalog,
  favorites,
  uploadedGarments,
  onDownload,
  onRemove,
  onClear,
  onToggleFavorite,
  onViewDescription,
  onRegenerateWithAI
}: MediaDashboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'generated' | 'favorites' | 'uploads'>('generated');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Estado para modal de regeneración
  const [regenerateModal, setRegenerateModal] = useState<{
    isOpen: boolean;
    item: CatalogItem | null;
    instructions: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    item: null,
    instructions: '',
    isLoading: false
  });

  // Filtrar items según el tab activo
  const getFilteredItems = () => {
    switch (selectedTab) {
      case 'generated':
        return catalog;
      case 'favorites':
        return catalog.filter(item => favorites.includes(item.id));
      case 'uploads':
        return []; // Los uploads se muestran diferente
      default:
        return catalog;
    }
  };

  const filteredItems = getFilteredItems();
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset page cuando cambia el tab
  const handleTabChange = (newTab: 'generated' | 'favorites' | 'uploads') => {
    setSelectedTab(newTab);
    setCurrentPage(1);
  };

  // Toggle expansion state for a specific item
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Handlers para modal de regeneración
  const openRegenerateModal = (item: CatalogItem) => {
    console.log('🚀 openRegenerateModal called with item:', item.title);
    setRegenerateModal({
      isOpen: true,
      item,
      instructions: '',
      isLoading: false
    });
    console.log('✅ Modal state updated to open');
  };

  const closeRegenerateModal = () => {
    setRegenerateModal({
      isOpen: false,
      item: null,
      instructions: '',
      isLoading: false
    });
  };

  const handleRegenerateSubmit = async () => {
    console.log('🔄 handleRegenerateSubmit called');
    console.log('Modal state:', regenerateModal);

    if (!regenerateModal.item || !regenerateModal.instructions.trim()) {
      console.log('❌ Validation failed:', {
        hasItem: !!regenerateModal.item,
        hasInstructions: !!regenerateModal.instructions.trim(),
        instructions: regenerateModal.instructions
      });
      return;
    }

    console.log('✅ Validation passed, starting regeneration...');
    setRegenerateModal(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('Calling onRegenerateWithAI with:', {
        itemTitle: regenerateModal.item.title,
        instructions: regenerateModal.instructions
      });
      await onRegenerateWithAI(regenerateModal.item, regenerateModal.instructions);
      console.log('✅ Regeneration successful, closing modal');
      closeRegenerateModal();
    } catch (error) {
      console.error('❌ Error regenerating image:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setRegenerateModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const tabs = [
    { id: 'generated' as const, label: 'Generated', count: catalog.length, icon: '🎨' },
    { id: 'favorites' as const, label: 'Favorites', count: favorites.length, icon: '❤️' },
    { id: 'uploads' as const, label: 'Uploads', count: uploadedGarments.length, icon: '📁' }
  ];

  // Debug log para ver el estado del modal
  console.log('📊 MediaDashboard render - Modal state:', {
    isOpen: regenerateModal.isOpen,
    hasItem: !!regenerateModal.item,
    itemTitle: regenerateModal.item?.title
  });

  return (
    <div className="space-y-6">
      {/* Header con tabs estilo Media Dashboard */}
      <GlassCard variant="dark" className="purple-glow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <h2 className="text-2xl font-bold text-white">Media Dashboard</h2>
          </div>
          {(selectedTab === 'generated' || selectedTab === 'favorites') && filteredItems.length > 0 && (
            <LiquidButton onClick={onClear} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4" />
              Limpiar {selectedTab === 'generated' ? 'Todo' : 'Favoritos'}
            </LiquidButton>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${selectedTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${selectedTab === tab.id ? 'bg-purple-700' : 'bg-zinc-700'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Info bar */}
        {(selectedTab !== 'uploads') && filteredItems.length > 0 && (
          <div className="flex items-center justify-between mb-6 text-sm">
            <div className="text-zinc-400">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} de {filteredItems.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Imágenes por página:</span>
              <select 
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                value={ITEMS_PER_PAGE}
                disabled
              >
                <option value="12">12 imágenes</option>
              </select>
            </div>
          </div>
        )}

        {/* Grid de imágenes - GENERATED & FAVORITES */}
        {(selectedTab === 'generated' || selectedTab === 'favorites') && currentItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentItems.map((item: CatalogItem) => {
              const isFavorite = favorites.includes(item.id);
              const isExpanded = expandedItems[item.id] || false;
              const maxDescriptionLength = 120;
              const shouldTruncate = item.description.length > maxDescriptionLength;
              const displayDescription = !isExpanded && shouldTruncate
                ? item.description.substring(0, maxDescriptionLength) + '...'
                : item.description;

              return (
                <div key={item.id} className="space-y-2 bg-zinc-900/30 border border-zinc-800 rounded-xl p-3 hover:border-purple-500/50 transition-colors">
                  {/* Imagen con fecha arriba */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900/50 border border-zinc-700">
                    <img
                      src={`data:${item.image.mediaType};base64,${item.image.base64Data}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Fecha */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
                        {new Date(item.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Descripción inline debajo de la imagen */}
                  <div className="space-y-1">
                    <h4 className="text-white text-sm font-bold leading-tight line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {displayDescription}
                    </p>
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="text-purple-400 hover:text-purple-300 text-xs font-medium"
                      >
                        {isExpanded ? '↑ Ver menos' : '↓ Ver más'}
                      </button>
                    )}
                  </div>

                  {/* 4 Botones funcionales con Regenerar con IA */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className={`px-3 py-2 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center ${
                        isFavorite
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-zinc-700 hover:bg-red-500'
                      }`}
                      title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRegenerateModal(item);
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
                      title="Regenerar con IA"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(item);
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
                      title="Descargar imagen"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grid de UPLOADS (prendas originales) */}
        {selectedTab === 'uploads' && uploadedGarments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedGarments.map((garment) => (
              <div 
                key={garment.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-green-500 transition-all"
              >
                <img 
                  src={garment.image}
                  alt={garment.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium">{garment.name}</p>
                    <p className="text-zinc-300 text-xs">Prenda original</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estados vacíos */}
        {selectedTab === 'generated' && catalog.length === 0 && (
          <EmptyState 
            icon="📸"
            title="No hay imágenes generadas aún"
            message="Sube un modelo y una prenda para comenzar a generar tu catálogo"
          />
        )}

        {selectedTab === 'favorites' && favorites.length === 0 && (
          <EmptyState 
            icon="❤️"
            title="No tienes favoritos guardados"
            message="Marca imágenes como favoritas para acceder rápidamente a ellas"
          />
        )}

        {selectedTab === 'uploads' && uploadedGarments.length === 0 && (
          <EmptyState 
            icon="📁"
            title="No hay prendas guardadas"
            message="Las prendas que subas se guardarán aquí automáticamente"
          />
        )}

        {/* Paginación */}
        {totalPages > 1 && selectedTab !== 'uploads' && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        px-3 py-1 rounded-lg font-medium transition-colors
                        ${currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="px-2 text-zinc-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </GlassCard>

      {/* Modal de Regeneración con IA */}
      {(() => {
        console.log('🎭 Checking modal render condition:', {
          isOpen: regenerateModal.isOpen,
          hasItem: !!regenerateModal.item,
          shouldRender: regenerateModal.isOpen && !!regenerateModal.item
        });
        return null;
      })()}
      {regenerateModal.isOpen && regenerateModal.item && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={closeRegenerateModal}
        >
          <div
            className="bg-zinc-900 border-2 border-purple-500/50 rounded-xl max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-purple-400" />
                Regenerar con IA
              </h3>
              <button
                onClick={closeRegenerateModal}
                className="text-zinc-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition-colors"
                disabled={regenerateModal.isLoading}
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Preview de la imagen actual */}
              <div className="flex gap-4">
                <img
                  src={`data:${regenerateModal.item.image.mediaType};base64,${regenerateModal.item.image.base64Data}`}
                  alt={regenerateModal.item.title}
                  className="w-32 h-32 object-cover rounded-lg border border-zinc-700"
                />
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">{regenerateModal.item.title}</h4>
                  <p className="text-zinc-400 text-sm line-clamp-3">{regenerateModal.item.description}</p>
                </div>
              </div>

              {/* Instrucciones */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  ¿Qué quieres cambiar?
                </label>
                <textarea
                  value={regenerateModal.instructions}
                  onChange={(e) => setRegenerateModal(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Ejemplo: fondo exterior con naturaleza, prenda más brillante, modelo sonriendo..."
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 resize-none"
                  rows={4}
                  disabled={regenerateModal.isLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey && regenerateModal.instructions.trim()) {
                      handleRegenerateSubmit();
                    }
                  }}
                />
                <p className="text-xs text-zinc-500 mt-2">
                  💡 Tip: Presiona Ctrl + Enter para regenerar
                </p>
              </div>

              {/* Ejemplos de sugerencias */}
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <p className="text-xs text-purple-400 font-semibold mb-2">EJEMPLOS DE CAMBIOS:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Fondo exterior',
                    'Prenda más brillante',
                    'Modelo sonriendo',
                    'Iluminación cálida',
                    'Pose más dinámica',
                    'Fondo blanco minimalista'
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setRegenerateModal(prev => ({
                        ...prev,
                        instructions: prev.instructions ? `${prev.instructions}, ${example.toLowerCase()}` : example
                      }))}
                      className="px-3 py-1 bg-zinc-700 hover:bg-purple-600 text-white text-xs rounded-full transition-colors"
                      disabled={regenerateModal.isLoading}
                    >
                      + {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex gap-4 p-6 border-t border-zinc-800">
              <button
                onClick={closeRegenerateModal}
                className="flex-1 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl transition-colors"
                disabled={regenerateModal.isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleRegenerateSubmit}
                disabled={!regenerateModal.instructions.trim() || regenerateModal.isLoading}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {regenerateModal.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Regenerando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Regenerar con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de estado vacío
function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400">{message}</p>
    </div>
  );
}
