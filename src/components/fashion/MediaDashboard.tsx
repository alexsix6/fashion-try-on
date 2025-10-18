'use client'

import { useState } from 'react';
import { CatalogItem } from '@/lib/types';
import { Download, Trash2, ChevronLeft, ChevronRight, Heart, Info, Image as ImageIcon } from 'lucide-react';
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
  onViewDescription
}: MediaDashboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'generated' | 'favorites' | 'uploads'>('generated');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

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

  const handleViewDescription = (item: CatalogItem) => {
    setSelectedItem(item);
    setShowDescriptionModal(true);
    onViewDescription(item);
  };

  const tabs = [
    { id: 'generated' as const, label: 'Generated', count: catalog.length, icon: '🎨' },
    { id: 'favorites' as const, label: 'Favorites', count: favorites.length, icon: '❤️' },
    { id: 'uploads' as const, label: 'Uploads', count: uploadedGarments.length, icon: '📁' }
  ];

  return (
    <div className="space-y-6">
      {/* Header con tabs estilo Media Dashboard */}
      <GlassCard variant="dark" className="purple-glow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <h2 className="text-2xl font-bold text-white">Media Dashboard</h2>
            <button 
              className="ml-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
              title="Próximamente: Combinar múltiples prendas"
            >
              🔗 Combine
            </button>
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
              return (
                <div key={item.id} className="space-y-2">
                  {/* Imagen con solo la fecha arriba */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900/50 border-2 border-zinc-800 hover:border-purple-500 transition-colors shadow-lg">
                    <img 
                      src={`data:${item.image.mediaType};base64,${item.image.base64Data}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Solo fecha - sin corazón */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
                        {new Date(item.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* 4 Botones funcionales - SIN título */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        console.log('🔵 Botón descripción clickeado!', item.title);
                        console.log('🔵 Item completo:', item);
                        setSelectedItem(item);
                        setShowDescriptionModal(true);
                        console.log('🔵 Modal debería abrirse ahora!');
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
                      title="Ver descripción completa"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    
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

      {/* Modal de descripción - MEJORADO */}
      {(() => {
        console.log('🟢 Renderizando modal check:', { showDescriptionModal, hasSelectedItem: !!selectedItem });
        return null;
      })()}
      {showDescriptionModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowDescriptionModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className="bg-zinc-900 border-2 border-purple-500/50 rounded-xl max-w-6xl w-full max-h-[85vh] relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            {/* Header fijo */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Info className="w-6 h-6 text-purple-400" />
                Descripción Completa
              </h3>
              <button 
                onClick={() => setShowDescriptionModal(false)}
                className="text-zinc-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="grid md:grid-cols-[400px,1fr] gap-6 p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="space-y-4">
                <img 
                  src={`data:${selectedItem.image.mediaType};base64,${selectedItem.image.base64Data}`}
                  alt={selectedItem.title}
                  className="w-full rounded-xl shadow-2xl"
                />
                <div className="text-center text-xs text-zinc-500">
                  Creado el {new Date(selectedItem.createdAt).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-purple-400 mb-3 uppercase tracking-wide">Título</h4>
                  <p className="text-white text-xl font-semibold leading-relaxed">{selectedItem.title}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-purple-400 mb-3 uppercase tracking-wide">Descripción Completa</h4>
                  <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                    {selectedItem.description}
                  </div>
                </div>
                
                {selectedItem.metadata && (
                  <div>
                    <h4 className="text-sm font-bold text-purple-400 mb-3 uppercase tracking-wide">Detalles Técnicos</h4>
                    <div className="space-y-2">
                      {selectedItem.metadata.colors && selectedItem.metadata.colors.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-zinc-500 font-medium min-w-[80px]">Colores:</span>
                          <span className="text-white">{selectedItem.metadata.colors.join(', ')}</span>
                        </div>
                      )}
                      {selectedItem.metadata.style && (
                        <div className="flex items-start gap-2">
                          <span className="text-zinc-500 font-medium min-w-[80px]">Estilo:</span>
                          <span className="text-white">{selectedItem.metadata.style}</span>
                        </div>
                      )}
                      {selectedItem.metadata.garmentType && (
                        <div className="flex items-start gap-2">
                          <span className="text-zinc-500 font-medium min-w-[80px]">Tipo:</span>
                          <span className="text-white">{selectedItem.metadata.garmentType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex gap-4 p-6 border-t border-zinc-800 bg-zinc-900">
              <button
                onClick={() => onDownload(selectedItem)}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
              >
                <Download className="w-5 h-5" />
                Descargar
              </button>
              <button
                onClick={() => {
                  onToggleFavorite(selectedItem.id);
                }}
                className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-xl ${
                  favorites.includes(selectedItem.id)
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(selectedItem.id) ? 'fill-current' : ''}`} />
                {favorites.includes(selectedItem.id) ? 'Favorito' : 'Añadir a Favoritos'}
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
