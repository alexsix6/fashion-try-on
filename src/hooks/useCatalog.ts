import { useState, useCallback, useEffect } from 'react';
import { CatalogItem, CatalogState, GeneratedImage } from '@/lib/types';

const CATALOG_STORAGE_KEY = 'fashion-catalog';

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogState>({
    items: [],
    selectedItem: null
  });

  // Cargar catálogo desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedCatalog = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (savedCatalog) {
        const parsed = JSON.parse(savedCatalog);
        // Convertir strings de fecha de vuelta a Date objects
        const itemsWithDates = parsed.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setCatalog({
          items: itemsWithDates,
          selectedItem: null
        });
      }
    } catch (error) {
      console.error('Error loading catalog from storage:', error);
    }
  }, []);

  // Guardar catálogo en localStorage con manejo de cuota
  const saveCatalog = useCallback((newCatalog: CatalogState) => {
    try {
      const catalogData = JSON.stringify(newCatalog);
      const catalogSizeKB = (catalogData.length / 1024).toFixed(2);
      
      console.log(`Saving catalog: ${catalogSizeKB}KB, ${newCatalog.items.length} items`);
      
      // Verificar tamaño antes de guardar
      if (catalogData.length > 4 * 1024 * 1024) { // 4MB límite
        console.warn('Catalog too large, removing oldest items...');
        
        // Mantener solo los 10 items más recientes
        const trimmedCatalog = {
          ...newCatalog,
          items: newCatalog.items
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
        };
        
        localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(trimmedCatalog));
        console.log('Catalog trimmed to 10 most recent items');
      } else {
        localStorage.setItem(CATALOG_STORAGE_KEY, catalogData);
      }
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        console.error('Storage quota exceeded, clearing old items...');
        
        // Estrategia de recuperación: mantener solo los 5 items más recientes
        const emergencyCatalog = {
          ...newCatalog,
          items: newCatalog.items
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
        };
        
        try {
          localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(emergencyCatalog));
          console.log('Emergency: Catalog reduced to 5 items');
        } catch (emergencyError) {
          console.error('Emergency save failed, clearing catalog:', emergencyError);
          localStorage.removeItem(CATALOG_STORAGE_KEY);
        }
      } else {
        console.error('Error saving catalog to storage:', error);
      }
    }
  }, []);

  // Función para generar metadatos automáticamente
  const generateMetadata = (title: string, description: string) => {
    const text = (title + ' ' + description).toLowerCase();
    
    // Detectar tipo de prenda
    let garmentType: any = 'otro';
    if (text.includes('camisa') || text.includes('blusa')) garmentType = 'camisa';
    else if (text.includes('pantalon') || text.includes('pants')) garmentType = 'pantalon';
    else if (text.includes('vestido') || text.includes('dress')) garmentType = 'vestido';
    else if (text.includes('falda') || text.includes('skirt')) garmentType = 'falda';
    else if (text.includes('chaqueta') || text.includes('jacket')) garmentType = 'chaqueta';
    else if (text.includes('sueter') || text.includes('sweater')) garmentType = 'sueter';
    else if (text.includes('shorts')) garmentType = 'shorts';

    // Detectar colores
    const colors: string[] = [];
    const colorKeywords = {
      'rojo': ['rojo', 'red', 'carmesi', 'escarlata'],
      'azul': ['azul', 'blue', 'marino', 'celeste'],
      'verde': ['verde', 'green', 'esmeralda', 'oliva'],
      'negro': ['negro', 'black'],
      'blanco': ['blanco', 'white'],
      'gris': ['gris', 'gray', 'grey'],
      'rosa': ['rosa', 'pink', 'rosado'],
      'amarillo': ['amarillo', 'yellow'],
      'morado': ['morado', 'purple', 'violeta'],
      'marron': ['marron', 'brown', 'cafe']
    };
    
    Object.entries(colorKeywords).forEach(([color, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        colors.push(color);
      }
    });

    // Detectar estilo
    let style: any = 'casual';
    if (text.includes('formal') || text.includes('elegante') || text.includes('profesional')) style = 'formal';
    else if (text.includes('deportivo') || text.includes('sport')) style = 'deportivo';
    else if (text.includes('elegante') || text.includes('sofisticado')) style = 'elegante';
    else if (text.includes('noche') || text.includes('night')) style = 'nocturno';

    // Detectar género (básico)
    let gender: any = 'unisex';
    if (text.includes('mujer') || text.includes('femenino') || text.includes('vestido') || text.includes('falda')) gender = 'mujer';
    else if (text.includes('hombre') || text.includes('masculino')) gender = 'hombre';

    // Detectar ocasión
    let occasion: any = 'casual';
    if (text.includes('trabajo') || text.includes('oficina') || style === 'formal') occasion = 'trabajo';
    else if (text.includes('fiesta') || text.includes('party')) occasion = 'fiesta';
    else if (text.includes('deporte') || text.includes('gym')) occasion = 'deporte';
    else if (text.includes('noche') || text.includes('night')) occasion = 'noche';

    return {
      garmentType,
      colors: colors.length > 0 ? colors : ['sin_especificar'],
      style,
      gender,
      season: 'todo_año' as any,
      occasion
    };
  };

  // Agregar nuevo item al catálogo
  const addCatalogItem = useCallback((
    title: string,
    description: string,
    generatedImage: GeneratedImage,
    modelImage: string,
    garmentImage: string,
    tags?: string[]
  ) => {
    const metadata = generateMetadata(title, description);
    
    const newItem: CatalogItem = {
      id: crypto.randomUUID(),
      title,
      description,
      image: generatedImage,
      modelImage,
      garmentImage,
      createdAt: new Date(),
      tags,
      metadata
    };

    const newCatalog = {
      ...catalog,
      items: [newItem, ...catalog.items] // Agregar al inicio
    };

    setCatalog(newCatalog);
    saveCatalog(newCatalog);
    
    return newItem;
  }, [catalog, saveCatalog]);

  // Seleccionar item del catálogo
  const selectCatalogItem = useCallback((item: CatalogItem | null) => {
    setCatalog(prev => ({
      ...prev,
      selectedItem: item
    }));
  }, []);

  // Eliminar item del catálogo
  const removeCatalogItem = useCallback((itemId: string) => {
    const newCatalog = {
      ...catalog,
      items: catalog.items.filter(item => item.id !== itemId),
      selectedItem: catalog.selectedItem?.id === itemId ? null : catalog.selectedItem
    };

    setCatalog(newCatalog);
    saveCatalog(newCatalog);
  }, [catalog, saveCatalog]);

  // Limpiar catálogo completo
  const clearCatalog = useCallback(() => {
    const emptyCatalog = { items: [], selectedItem: null };
    setCatalog(emptyCatalog);
    
    // Limpiar localStorage directamente para evitar errores de cuota
    try {
      localStorage.removeItem(CATALOG_STORAGE_KEY);
      console.log('Catalog cleared from localStorage');
    } catch (error) {
      console.error('Error clearing catalog from storage:', error);
    }
  }, []);

  // Nueva función: Obtener información de almacenamiento
  const getStorageInfo = useCallback(() => {
    try {
      const catalogData = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (catalogData) {
        const sizeKB = (catalogData.length / 1024).toFixed(2);
        const itemCount = catalog.items.length;
        return { sizeKB, itemCount, hasData: true };
      }
      return { sizeKB: '0', itemCount: 0, hasData: false };
    } catch (error) {
      return { sizeKB: 'Error', itemCount: 0, hasData: false };
    }
  }, [catalog.items.length]);

  // Descargar imagen como archivo
  const downloadImage = useCallback((item: CatalogItem, filename?: string) => {
    try {
      const link = document.createElement('a');
      link.href = `data:${item.image.mediaType};base64,${item.image.base64Data}`;
      link.download = filename || `catalog-${item.title.replace(/\s+/g, '-').toLowerCase()}-${item.id.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, []);

  return {
    // State
    catalog: catalog.items,
    selectedItem: catalog.selectedItem,
    catalogCount: catalog.items.length,

    // Actions
    addCatalogItem,
    selectCatalogItem,
    removeCatalogItem,
    clearCatalog,
    downloadImage,
    
    // Storage info
    getStorageInfo
  };
}
