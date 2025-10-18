'use client'

import { useState } from 'react'
import { Heart, Download, CheckCircle } from 'lucide-react'
import { LiquidButton } from '@/components/ui/liquid-button'

interface Image {
  id: string
  url: string
  thumbnail?: string
  isFavorite?: boolean
  isSelected?: boolean
}

interface ImageGridProps {
  images: Image[]
  onSelect?: (imageId: string) => void
  onFavorite?: (imageId: string) => void
  onDownload?: (imageId: string) => void
  showingCount?: number
  totalCount?: number
  onShowingCountChange?: (count: number) => void
}

export default function ImageGrid({
  images,
  onSelect,
  onFavorite,
  onDownload,
  showingCount = 20,
  totalCount = images.length,
  onShowingCountChange
}: ImageGridProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())

  const displayedImages = images.slice(0, showingCount)

  const handleSelect = (imageId: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
    onSelect?.(imageId)
  }

  const showingOptions = [10, 20, 50, 100]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-purple-200">
          Showing <span className="font-bold text-white">{Math.min(showingCount, totalCount)}</span> of{' '}
          <span className="font-bold text-white">{totalCount}</span> images
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-200">Show:</span>
          <select
            value={showingCount}
            onChange={(e) => onShowingCountChange?.(Number(e.target.value))}
            className="px-3 py-1 bg-black/30 border border-purple-500/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
          >
            {showingOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayedImages.map((image) => {
          const isSelected = selectedImages.has(image.id)

          return (
            <div
              key={image.id}
              className={`
                relative group cursor-pointer rounded-lg overflow-hidden
                transition-all duration-300
                ${isSelected
                  ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 scale-105'
                  : 'hover:scale-105'
                }
              `}
              onClick={() => handleSelect(image.id)}
            >
              {/* Image */}
              <div className="aspect-square bg-black/40 relative">
                <img
                  src={image.thumbnail || image.url}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-purple-600 rounded-full p-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <LiquidButton
                    onClick={(e) => {
                      e.stopPropagation()
                      onFavorite?.(image.id)
                    }}
                    variant="space"
                    size="sm"
                    className={image.isFavorite ? 'text-red-400' : ''}
                  >
                    <Heart className={`w-4 h-4 ${image.isFavorite ? 'fill-current' : ''}`} />
                  </LiquidButton>

                  <LiquidButton
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload?.(image.id)
                    }}
                    variant="space"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                  </LiquidButton>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* No Images */}
      {images.length === 0 && (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-purple-500/20">
          <p className="text-purple-300 text-lg">No images in this category yet.</p>
          <p className="text-purple-400/60 text-sm mt-2">Upload model and garment photos to get started!</p>
        </div>
      )}
    </div>
  )
}
