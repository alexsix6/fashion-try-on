'use client'

import { useState, useCallback } from 'react'
import { Upload, User, Shirt } from 'lucide-react'
import { LiquidButton } from '@/components/ui/liquid-button'

interface UploadSectionProps {
  onUpload: (file: File, description?: string, tags?: string[]) => void
  onGenerateCatalog?: () => void
  uploadCount: number
}

export default function UploadSection({ onUpload, onGenerateCatalog, uploadCount }: UploadSectionProps) {
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [garmentFile, setGarmentFile] = useState<File | null>(null)
  const [modelPreview, setModelPreview] = useState<string | null>(null)
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null)

  const loadImagePreview = useCallback((file: File, setPreview: (preview: string) => void) => {
    if (!file.type.startsWith('image/')) {
      console.error('File is not an image:', file.type)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPreview(reader.result)
      }
    }
    reader.onerror = () => {
      console.error('Failed to read file:', reader.error)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleModelDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    if (imageFile) {
      setModelFile(imageFile)
      loadImagePreview(imageFile, setModelPreview)
    }
  }, [loadImagePreview])

  const handleGarmentDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    if (imageFile) {
      setGarmentFile(imageFile)
      loadImagePreview(imageFile, setGarmentPreview)
    }
  }, [loadImagePreview])

  const handleModelFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setModelFile(file)
      loadImagePreview(file, setModelPreview)
    }
  }, [loadImagePreview])

  const handleGarmentFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setGarmentFile(file)
      loadImagePreview(file, setGarmentPreview)
    }
  }, [loadImagePreview])

  const handleGenerateCatalog = async () => {
    if (modelFile && garmentFile) {
      // Upload model first
      await onUpload(modelFile, 'Model photo', ['model'])
      // Upload garment second
      await onUpload(garmentFile, 'Garment photo', ['garment'])

      // Call generate catalog function
      if (onGenerateCatalog) {
        await onGenerateCatalog()
      }

      // Reset local state
      setModelFile(null)
      setGarmentFile(null)
      setModelPreview(null)
      setGarmentPreview(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-400" />
          Upload Images for Virtual Try-On
        </h3>
      </div>

      {/* Two Upload Areas Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-200">
            <User className="w-4 h-4 inline mr-1" />
            Model Photo
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleModelDrop}
            className="relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 border-purple-500/30 bg-black/20 hover:border-purple-400/50"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleModelFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="model-upload"
            />

            {modelPreview ? (
              <div className="space-y-2">
                <img src={modelPreview} alt="Model preview" className="w-full h-40 object-cover rounded-lg" />
                <p className="text-xs text-green-400 text-center">✓ Model image loaded</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-4">
                <User className="w-10 h-10 text-purple-400 mb-2" />
                <p className="text-sm text-white font-medium mb-1">Upload model photo</p>
                <p className="text-xs text-purple-300">Drag & drop or click</p>
              </div>
            )}
          </div>
        </div>

        {/* Garment Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-200">
            <Shirt className="w-4 h-4 inline mr-1" />
            Garment Photo
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleGarmentDrop}
            className="relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 border-purple-500/30 bg-black/20 hover:border-purple-400/50"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleGarmentFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="garment-upload"
            />

            {garmentPreview ? (
              <div className="space-y-2">
                <img src={garmentPreview} alt="Garment preview" className="w-full h-40 object-cover rounded-lg" />
                <p className="text-xs text-green-400 text-center">✓ Garment image loaded</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-4">
                <Shirt className="w-10 h-10 text-purple-400 mb-2" />
                <p className="text-sm text-white font-medium mb-1">Upload garment photo</p>
                <p className="text-xs text-purple-300">Drag & drop or click</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button - Shows when both images are uploaded */}
      {modelFile && garmentFile && (
        <div className="flex justify-center">
          <LiquidButton onClick={handleGenerateCatalog} variant="space" size="xl">
            <Upload className="w-5 h-5" />
            Generate Virtual Try-On
          </LiquidButton>
        </div>
      )}

      {/* Helper Text */}
      {(!modelFile || !garmentFile) && (
        <p className="text-sm text-purple-300 text-center">
          Upload both model and garment photos to generate virtual try-on
        </p>
      )}
    </div>
  )
}
