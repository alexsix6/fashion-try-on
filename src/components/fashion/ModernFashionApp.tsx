'use client'

import { useState, useMemo } from 'react'
import { useFashionApp } from '@/hooks/useFashionApp'
import ChatSidebar from '@/components/chat/ChatSidebar'
import HorizontalTabs from '@/components/navigation/HorizontalTabs'
import UploadSection from '@/components/upload/UploadSection'
import ImageGrid from '@/components/gallery/ImageGrid'
import GlassCard from '@/components/ui/GlassCard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface DisplayImage {
  id: string
  url: string
  thumbnail?: string
  isFavorite?: boolean
  type?: 'catalog' | 'tryOn' | 'upload'
}

export default function ModernFashionApp() {
  const {
    mode,
    isLoading,
    error,
    uploadedImages,
    catalog,
    catalogCount,
    generatedImage,
    messages: fashionMessages,
    inputValue,
    isInputDisabled,
    setMode,
    uploadImage,
    removeImage,
    clearImages,
    generateCatalog,
    generateTryOn,
    sendMessage,
    setInputValue,
    clearError,
    selectedCatalogItem,
    selectCatalogItem,
    removeCatalogItem,
    clearCatalog,
    downloadImage,
    regenerateImage
  } = useFashionApp()

  const [activeTab, setActiveTab] = useState('uploads')
  const [showingCount, setShowingCount] = useState(20)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Convert fashion messages to chat format
  const chatMessages: Message[] = useMemo(() => {
    return fashionMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.timestamp).toLocaleTimeString()
    }))
  }, [fashionMessages])

  // Convert uploaded images and catalog to display format
  const allImages: DisplayImage[] = useMemo(() => {
    const images: DisplayImage[] = []

    // Add uploaded images
    uploadedImages.forEach(img => {
      images.push({
        id: img.id,
        url: img.preview,
        isFavorite: favorites.has(img.id),
        type: 'upload'
      })
    })

    // Add catalog items
    catalog.forEach(item => {
      if (item.image) {
        const imageUrl = `data:${item.image.mediaType};base64,${item.image.base64Data}`
        images.push({
          id: item.id,
          url: imageUrl,
          isFavorite: favorites.has(item.id),
          type: mode === 'owner' ? 'catalog' : 'tryOn'
        })
      }
    })

    // Add generated image if exists
    if (generatedImage?.image) {
      const imageUrl = `data:${generatedImage.image.mediaType};base64,${generatedImage.image.base64Data}`
      images.push({
        id: 'generated-' + Date.now(),
        url: imageUrl,
        isFavorite: favorites.has('generated'),
        type: mode === 'owner' ? 'catalog' : 'tryOn'
      })
    }

    return images
  }, [uploadedImages, catalog, generatedImage, favorites, mode])

  // Counts for tabs
  const counts = {
    catalog: allImages.filter(img => img.type === 'catalog').length,
    tryOn: allImages.filter(img => img.type === 'tryOn').length,
    combined: 0, // TODO: implement combined images
    favorites: allImages.filter(img => img.isFavorite).length,
    uploads: uploadedImages.length
  }

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  const handleClearChat = () => {
    // Messages are managed by useFashionApp, we might need to add a clearMessages function
  }

  const handleUpload = async (file: File, description?: string, tags?: string[]) => {
    // Determine type based on mode and existing uploads
    const type = mode === 'owner'
      ? (uploadedImages.length === 0 ? 'model' : 'garment')
      : 'customer'

    await uploadImage(file, type)
  }

  const handleGenerateCatalog = async () => {
    await generateCatalog()
  }

  const handleFavorite = (imageId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId)
      } else {
        newFavorites.add(imageId)
      }
      return newFavorites
    })
  }

  const handleDownload = (imageId: string) => {
    const catalogItem = catalog.find(item => item.id === imageId)
    if (catalogItem) {
      downloadImage(catalogItem)
    }
  }

  // Filter images based on active tab
  const filteredImages = useMemo(() => {
    switch (activeTab) {
      case 'catalog':
        return allImages.filter(img => img.type === 'catalog')
      case 'tryOn':
        return allImages.filter(img => img.type === 'tryOn')
      case 'combined':
        return [] // TODO: implement
      case 'favorites':
        return allImages.filter(img => img.isFavorite)
      case 'uploads':
        return allImages.filter(img => img.type === 'upload')
      default:
        return allImages
    }
  }, [activeTab, allImages])

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - AI Assistant */}
      <div className="w-80 flex-shrink-0">
        <ChatSidebar
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top - Horizontal Tabs */}
        <div className="p-4 border-b border-purple-500/20">
          <HorizontalTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Error Display */}
            {error && (
              <GlassCard variant="purple" className="bg-red-500/20 border-red-500/50">
                <div className="flex justify-between items-center">
                  <span className="text-red-200">{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-300 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <GlassCard variant="purple">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                  <span className="text-purple-200">Processing images...</span>
                </div>
              </GlassCard>
            )}

            {/* Upload Section - Only show in uploads tab */}
            {activeTab === 'uploads' && (
              <GlassCard variant="dark">
                <UploadSection
                  onUpload={handleUpload}
                  onGenerateCatalog={handleGenerateCatalog}
                  uploadCount={counts.uploads}
                />
              </GlassCard>
            )}

            {/* Image Grid - Show for all tabs */}
            <GlassCard variant="dark">
              <ImageGrid
                images={filteredImages}
                onFavorite={handleFavorite}
                onDownload={handleDownload}
                showingCount={showingCount}
                totalCount={filteredImages.length}
                onShowingCountChange={setShowingCount}
              />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
