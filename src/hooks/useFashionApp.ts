import { useState, useCallback } from 'react';
import { FashionMessage, GeneratedImage, CatalogResponse, ImageResponse, CatalogItem } from '@/lib/types';
import { UI_MESSAGES } from '@/lib/consts';
import { useCatalog } from './useCatalog';
import { analyzeGarmentImage, analyzePersonImage } from '@/lib/image-analyzer';
import { applyIntelligentWatermark } from '@/lib/watermark';

export type AppMode = 'owner' | 'customer';
export type ProcessStage = 'idle' | 'uploading' | 'generating-catalog' | 'generating-image' | 'complete';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'model' | 'garment' | 'customer';
}

interface FashionAppState {
  // Core state
  mode: AppMode;
  stage: ProcessStage;
  isLoading: boolean;
  error: string | null;
  
  // Images
  uploadedImages: UploadedImage[];
  generatedCatalog: CatalogResponse | null;
  generatedImage: ImageResponse | null;
  
  // Messages for conversation flow
  messages: FashionMessage[];
  
  // Input control
  inputValue: string;
  isInputDisabled: boolean;

  // New features
  favorites: string[]; // IDs de imágenes favoritas
  uploadedGarments: Array<{ id: string; image: string; name: string }>; // Prendas guardadas
}

interface FashionAppActions {
  // Mode control
  setMode: (mode: AppMode) => void;
  
  // Image upload
  uploadImage: (file: File, type: 'model' | 'garment' | 'customer') => Promise<void>;
  removeImage: (id: string) => void;
  clearImages: () => void;
  
  // Catalog generation (owner flow)
  generateCatalog: (description?: string) => Promise<void>;
  
  // Try-on generation (customer flow)  
  generateTryOn: (garmentId: string, customerImageId: string) => Promise<void>;
  
  // Regeneration with stricter criteria
  regenerateImage: () => Promise<void>;
  
  // Conversation flow
  sendMessage: (message: string) => Promise<void>;
  
  // Input control
  setInputValue: (value: string) => void;
  
  // Error handling
  clearError: () => void;
  
  // Reset
  resetApp: () => void;

  // Catalog management
  catalog: CatalogItem[];
  selectedCatalogItem: CatalogItem | null;
  catalogCount: number;
  selectCatalogItem: (item: CatalogItem | null) => void;
  removeCatalogItem: (itemId: string) => void;
  clearCatalog: () => void;
  downloadImage: (item: CatalogItem, filename?: string) => void;

  // New features
  favorites: string[];
  uploadedGarments: Array<{ id: string; image: string; name: string }>;
  toggleFavorite: (itemId: string) => void;
  viewDescription: (item: CatalogItem) => void;
}

const initialState: FashionAppState = {
  mode: 'owner',
  stage: 'idle',
  isLoading: false,
  error: null,
  uploadedImages: [],
  generatedCatalog: null,
  generatedImage: null,
  messages: [],
  inputValue: '',
  isInputDisabled: false,
  favorites: [],
  uploadedGarments: [],
};

export function useFashionApp(): FashionAppState & FashionAppActions {
  const [state, setState] = useState<FashionAppState>(initialState);
  const catalogHook = useCatalog();

  // Utility function to update state
  const updateState = useCallback((updates: Partial<FashionAppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Mode control
  const setMode = useCallback((mode: AppMode) => {
    updateState({ 
      mode, 
      stage: 'idle',
      error: null,
      uploadedImages: [],
      generatedCatalog: null,
      generatedImage: null,
      messages: []
    });
  }, [updateState]);

  // Image upload handler
  const uploadImage = useCallback(async (file: File, type: 'model' | 'garment' | 'customer') => {
    try {
      updateState({ isLoading: true, error: null, stage: 'uploading' });

      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      // Create uploaded image object
      const uploadedImage: UploadedImage = {
        id: crypto.randomUUID(),
        file,
        preview,
        type
      };

      // Si es una prenda, guardarla en uploadedGarments
      if (type === 'garment') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const newGarment = {
            id: uploadedImage.id,
            image: base64,
            name: file.name
          };
          updateState({
            uploadedGarments: [...state.uploadedGarments, newGarment]
          });
        };
        reader.readAsDataURL(file);
      }

      // Add to uploaded images
      updateState({
        uploadedImages: [...state.uploadedImages, uploadedImage],
        isLoading: false,
        stage: 'idle'
      });

    } catch (error) {
      updateState({
        error: 'Error uploading image',
        isLoading: false,
        stage: 'idle'
      });
    }
  }, [state.uploadedImages, state.uploadedGarments, updateState]);

  // Remove image
  const removeImage = useCallback((id: string) => {
    const updatedImages = state.uploadedImages.filter(img => img.id !== id);
    // Cleanup URL
    const imageToRemove = state.uploadedImages.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    updateState({ uploadedImages: updatedImages });
  }, [state.uploadedImages, updateState]);

  // Clear all images
  const clearImages = useCallback(() => {
    // Cleanup all URLs
    state.uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    updateState({ 
      uploadedImages: [],
      generatedCatalog: null,
      generatedImage: null 
    });
  }, [state.uploadedImages, updateState]);

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix to get just the base64 data
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Generate catalog (owner flow)
  const generateCatalog = useCallback(async (description?: string) => {
    try {
      updateState({ 
        isLoading: true, 
        error: null, 
        stage: 'generating-image' 
      });

      const modelImage = state.uploadedImages.find(img => img.type === 'model');
      const garmentImage = state.uploadedImages.find(img => img.type === 'garment');

      if (!modelImage || !garmentImage) {
        throw new Error(UI_MESSAGES.ERROR.UPLOAD_REQUIRED);
      }

      // Convert images to base64
      const modelBase64 = await fileToBase64(modelImage.file);
      const garmentBase64 = await fileToBase64(garmentImage.file);

      // ANÁLISIS INTELIGENTE: Extraer características específicas
      updateState({ stage: 'generating-catalog' });
      console.log('=== ANÁLISIS DE IMÁGENES ===');
      
      const [garmentAnalysis, personAnalysis] = await Promise.all([
        analyzeGarmentImage(garmentBase64),
        analyzePersonImage(modelBase64)
      ]);
      
      console.log('Garment analysis:', garmentAnalysis);
      console.log('Person analysis:', personAnalysis);

      // PASO 1: Generar imagen con Nano Banana usando análisis específico
      updateState({ stage: 'generating-image' });
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt: 'Modelo profesional portando prenda elegante en sesión fotográfica de moda, iluminación natural, fondo moderno',
          modelImage: modelBase64,
          garmentImage: garmentBase64,
          mode: 'catalog', // MODO DUEÑO: Máxima fidelidad de prenda
          garmentDescription: garmentAnalysis, // Descripción específica extraída por IA
          personDescription: personAnalysis // Descripción específica extraída por IA
        })
      });

      if (!imageResponse.ok) throw new Error('Failed to generate image');
      const imageData: ImageResponse = await imageResponse.json();
      
      if (!imageData.image) {
        throw new Error('No image was generated');
      }

      // PASO 2: Generar descripción (fallback si falla)
      updateState({ stage: 'generating-catalog' });
      let catalogData: CatalogResponse;
      
      try {
        const response = await fetch('/api/generate-catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: 'Analizar imagen generada',
            conversationHistory: [],
            isStart: true,
            mode: 'catalog',
            generatedImage: imageData.image.base64Data
          })
        });

        if (response.ok) {
          catalogData = await response.json();
        } else {
          throw new Error('Catalog generation failed');
        }
      } catch {
        // Fallback si falla la descripción
        catalogData = {
          story: 'Esta elegante prenda combina estilo y sofisticación, perfecta para cualquier ocasión especial. Su diseño cuidadosamente elaborado refleja las últimas tendencias de la moda contemporánea.',
          imagePrompt: ''
        };
      }

          // APLICAR MARCA DE AGUA INTELIGENTE
          if (imageData.image) {
            console.log('=== APLICANDO MARCA DE AGUA INTELIGENTE ===');
            
            try {
              const watermarkedBase64 = await applyIntelligentWatermark(
                imageData.image.base64Data,
                {
                  position: 'bottom-right',
                  opacity: 0.6,
                  size: 'medium',
                  style: 'full' // isotipo + texto "VINTAGE DE LIZ"
                }
              );

              const generatedImage: GeneratedImage = {
                base64Data: watermarkedBase64,
                mediaType: imageData.image.mediaType,
                uint8ArrayData: new Uint8Array()
              };

              const title = catalogData.story.split('\n')[0].substring(0, 50) + '...';

              catalogHook.addCatalogItem(
                title,
                catalogData.story,
                generatedImage,
                modelBase64,
                garmentBase64,
                ['generated', 'catalog', 'watermarked']
              );

              console.log('Marca de agua aplicada exitosamente');
            } catch (watermarkError) {
              console.error('Error aplicando marca de agua:', watermarkError);
              
              // Fallback sin marca de agua
              const generatedImage: GeneratedImage = {
                base64Data: imageData.image.base64Data,
                mediaType: imageData.image.mediaType,
                uint8ArrayData: new Uint8Array()
              };

              const title = catalogData.story.split('\n')[0].substring(0, 50) + '...';

              catalogHook.addCatalogItem(
                title,
                catalogData.story,
                generatedImage,
                modelBase64,
                garmentBase64,
                ['generated', 'catalog']
              );
            }
          }
      
      updateState({
        generatedCatalog: catalogData,
        generatedImage: imageData,
        isLoading: false,
        stage: 'complete'
      });

    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : UI_MESSAGES.ERROR.CATALOG_GENERATION,
        isLoading: false,
        stage: 'idle'
      });
    }
  }, [state.uploadedImages, updateState, catalogHook]);

  // Generate try-on (customer flow)
  const generateTryOn = useCallback(async (garmentId: string, customerImageId: string) => {
    try {
      updateState({ 
        isLoading: true, 
        error: null, 
        stage: 'generating-image' 
      });

      // Encontrar el item del catálogo seleccionado
      const selectedItem = catalogHook.selectedItem;
      const customerImage = state.uploadedImages.find(img => img.id === customerImageId);

      if (!selectedItem || !customerImage) {
        throw new Error('Falta seleccionar prenda del catálogo o subir foto personal');
      }

      // Convertir imagen del cliente a base64
      const customerBase64 = await fileToBase64(customerImage.file);

      // ANÁLISIS INTELIGENTE DEL CLIENTE: Extraer características específicas
      console.log('=== ANÁLISIS DE CLIENTE PARA TRY-ON ===');
      const customerAnalysis = await analyzePersonImage(customerBase64);
      console.log('Customer analysis:', customerAnalysis);

      // Generar descripción personalizada para try-on
      const tryOnPrompt = `Cliente personal usando exactamente la prenda del catálogo: ${selectedItem.title}`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt: tryOnPrompt,
          modelImage: customerBase64, // La foto del cliente se convierte en el "modelo"
          garmentImage: selectedItem.garmentImage, // Imagen original de la prenda del catálogo
          mode: 'tryon', // MODO CLIENTE: Fidelidad persona + prenda
          garmentDescription: `Prenda específica del catálogo: ${selectedItem.title}. ${selectedItem.description}`,
          personDescription: customerAnalysis // Descripción específica extraída por IA del cliente
        })
      });

      if (!response.ok) throw new Error('Failed to generate try-on');

      const imageData: ImageResponse = await response.json();
      
      // APLICAR MARCA DE AGUA AL TRY-ON
      if (imageData.image) {
        try {
          console.log('=== APLICANDO MARCA DE AGUA AL TRY-ON ===');
          const watermarkedBase64 = await applyIntelligentWatermark(
            imageData.image.base64Data,
            {
              position: 'bottom-right',
              opacity: 0.5, // Más sutil en try-on personal
              size: 'small',
              style: 'isotipo' // Solo isotipo para try-on personal
            }
          );

          const watermarkedImage: ImageResponse = {
            ...imageData,
            image: {
              ...imageData.image,
              base64Data: watermarkedBase64
            }
          };

          updateState({
            generatedImage: watermarkedImage,
            isLoading: false,
            stage: 'complete'
          });
        } catch (watermarkError) {
          console.error('Error aplicando marca de agua al try-on:', watermarkError);
          // Fallback sin marca de agua
          updateState({
            generatedImage: imageData,
            isLoading: false,
            stage: 'complete'
          });
        }
      } else {
        updateState({
          generatedImage: imageData,
          isLoading: false,
          stage: 'complete'
        });
      }

    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : UI_MESSAGES.ERROR.TRYON_GENERATION,
        isLoading: false,
        stage: 'idle'
      });
    }
  }, [catalogHook.selectedItem, state.uploadedImages, updateState]);

  // Regenerate image with stricter criteria
  const regenerateImage = useCallback(async () => {
    try {
      updateState({
        isLoading: true,
        error: null,
        stage: 'generating-image'
      });

      console.log('=== REGENERANDO CON CRITERIOS ULTRA-ESTRICTOS ===');

      if (state.mode === 'owner') {
        // REGENERAR MODO DUEÑO
        const modelImage = state.uploadedImages.find(img => img.type === 'model');
        const garmentImage = state.uploadedImages.find(img => img.type === 'garment');

        if (!modelImage || !garmentImage) {
          throw new Error('Se requieren imágenes del modelo y prenda para regenerar');
        }

        const modelBase64 = await fileToBase64(modelImage.file);
        const garmentBase64 = await fileToBase64(garmentImage.file);

        // Análisis más detallado para regeneración
        console.log('=== ANÁLISIS ULTRA-DETALLADO PARA REGENERACIÓN ===');
        const [garmentAnalysis, personAnalysis] = await Promise.all([
          analyzeGarmentImage(garmentBase64),
          analyzePersonImage(modelBase64)
        ]);

        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagePrompt: 'REGENERACIÓN ULTRA-ESTRICTA: Reemplazo completo de prenda con máxima precisión',
            modelImage: modelBase64,
            garmentImage: garmentBase64,
            mode: 'catalog',
            garmentDescription: `REGENERACIÓN ESTRICTA: ${garmentAnalysis}. DEBE reemplazar completamente la prenda original, NO superponer.`,
            personDescription: `REGENERACIÓN: ${personAnalysis}. Mantener pose pero con nueva prenda únicamente.`
          })
        });

        if (!imageResponse.ok) throw new Error('Failed to regenerate image');
        const imageData: ImageResponse = await imageResponse.json();

        // APLICAR MARCA DE AGUA A REGENERACIÓN CATÁLOGO
        if (imageData.image) {
          try {
            console.log('=== APLICANDO MARCA DE AGUA A REGENERACIÓN CATÁLOGO ===');
            const watermarkedBase64 = await applyIntelligentWatermark(
              imageData.image.base64Data,
              {
                position: 'bottom-right',
                opacity: 0.6,
                size: 'medium',
                style: 'full'
              }
            );

            const watermarkedImage: ImageResponse = {
              ...imageData,
              image: {
                ...imageData.image,
                base64Data: watermarkedBase64
              }
            };

            updateState({
              generatedImage: watermarkedImage,
              isLoading: false,
              stage: 'complete'
            });
          } catch (watermarkError) {
            console.error('Error aplicando marca de agua a regeneración:', watermarkError);
            updateState({
              generatedImage: imageData,
              isLoading: false,
              stage: 'complete'
            });
          }
        } else {
          updateState({
            generatedImage: imageData,
            isLoading: false,
            stage: 'complete'
          });
        }

      } else if (state.mode === 'customer') {
        // REGENERAR MODO CLIENTE
        const customerImage = state.uploadedImages.find(img => img.type === 'customer');
        const selectedItem = catalogHook.selectedItem;

        if (!customerImage || !selectedItem) {
          throw new Error('Se requiere foto personal y prenda seleccionada para regenerar');
        }

        const customerBase64 = await fileToBase64(customerImage.file);
        const customerAnalysis = await analyzePersonImage(customerBase64);

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagePrompt: 'REGENERACIÓN ULTRA-ESTRICTA: Identidad exacta de persona + prenda del catálogo',
            modelImage: customerBase64,
            garmentImage: selectedItem.garmentImage,
            mode: 'tryon',
            garmentDescription: `REGENERACIÓN: ${selectedItem.title}. ${selectedItem.description}`,
            personDescription: `REGENERACIÓN IDENTIDAD ABSOLUTA: ${customerAnalysis}. Esta MISMA persona exacta, NO otra persona.`
          })
        });

        if (!response.ok) throw new Error('Failed to regenerate try-on');
        const imageData: ImageResponse = await response.json();

        // APLICAR MARCA DE AGUA A REGENERACIÓN TRY-ON
        if (imageData.image) {
          try {
            console.log('=== APLICANDO MARCA DE AGUA A REGENERACIÓN TRY-ON ===');
            const watermarkedBase64 = await applyIntelligentWatermark(
              imageData.image.base64Data,
              {
                position: 'bottom-right',
                opacity: 0.5,
                size: 'small',
                style: 'isotipo'
              }
            );

            const watermarkedImage: ImageResponse = {
              ...imageData,
              image: {
                ...imageData.image,
                base64Data: watermarkedBase64
              }
            };

            updateState({
              generatedImage: watermarkedImage,
              isLoading: false,
              stage: 'complete'
            });
          } catch (watermarkError) {
            console.error('Error aplicando marca de agua a regeneración try-on:', watermarkError);
            updateState({
              generatedImage: imageData,
              isLoading: false,
              stage: 'complete'
            });
          }
        } else {
          updateState({
            generatedImage: imageData,
            isLoading: false,
            stage: 'complete'
          });
        }
      }

    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Error al regenerar imagen',
        isLoading: false,
        stage: 'idle'
      });
    }
  }, [state.mode, state.uploadedImages, catalogHook.selectedItem, updateState]);

  // Send message (conversation flow)
  const sendMessage = useCallback(async (message: string) => {
    try {
      updateState({ 
        isLoading: true, 
        error: null,
        inputValue: '',
        isInputDisabled: true
      });

      // Add user message
      const userMessage: FashionMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        imageLoading: false
      };

      const updatedMessages = [...state.messages, userMessage];
      updateState({ messages: updatedMessages });

      // Call appropriate API based on mode
      const response = await fetch('/api/generate-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: message,
          conversationHistory: updatedMessages.slice(0, -1).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          isStart: updatedMessages.length === 1,
          mode: state.mode === 'owner' ? 'catalog' : 'tryon'
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data: CatalogResponse = await response.json();

      // Add assistant message
      const assistantMessage: FashionMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.story,
        timestamp: new Date().toISOString(),
        imageLoading: true
      };

      const messagesWithAssistant = [...updatedMessages, assistantMessage];
      updateState({ 
        messages: messagesWithAssistant,
        isLoading: false,
        isInputDisabled: false
      });

      // Generate image if prompt available
      if (data.imagePrompt) {
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagePrompt: data.imagePrompt
          })
        });

        if (imageResponse.ok) {
          const imageData: ImageResponse = await imageResponse.json();
          
          // Create GeneratedImage object with correct structure
          const generatedImage: GeneratedImage | undefined = imageData.image ? {
            base64Data: imageData.image.base64Data || '',
            mediaType: imageData.image.mediaType || 'image/png',
            uint8ArrayData: new Uint8Array()
          } : undefined;
          
          // Update message with image using setState to get fresh state
          setState(currentState => ({
            ...currentState,
            messages: currentState.messages.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, image: generatedImage, imageLoading: false }
                : msg
            )
          }));
        }
      }

    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Error sending message',
        isLoading: false,
        isInputDisabled: false
      });
    }
  }, [state.messages, state.mode, updateState]);

  // Input control
  const setInputValue = useCallback((value: string) => {
    updateState({ inputValue: value });
  }, [updateState]);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Reset app
  const resetApp = useCallback(() => {
    // Cleanup URLs
    state.uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setState(initialState);
  }, [state.uploadedImages]);

  // Toggle favorite
  const toggleFavorite = useCallback((itemId: string) => {
    updateState({
      favorites: state.favorites.includes(itemId)
        ? state.favorites.filter(id => id !== itemId)
        : [...state.favorites, itemId]
    });
  }, [state.favorites, updateState]);

  // View description (for logging/analytics)
  const viewDescription = useCallback((item: CatalogItem) => {
    console.log('Viewing description for:', item.title);
  }, []);

  return {
    // State
    ...state,
    
    // Catalog state
    catalog: catalogHook.catalog,
    selectedCatalogItem: catalogHook.selectedItem,
    catalogCount: catalogHook.catalogCount,
    
    // Actions
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
    
    // Catalog actions
    selectCatalogItem: catalogHook.selectCatalogItem,
    removeCatalogItem: catalogHook.removeCatalogItem,
    clearCatalog: catalogHook.clearCatalog,
    downloadImage: catalogHook.downloadImage,

    // New actions
    toggleFavorite,
    viewDescription,
  };
}