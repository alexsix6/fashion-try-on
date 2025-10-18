import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFashionApp } from '@/hooks/useFashionApp'

// Mock useCatalog hook
vi.mock('@/hooks/useCatalog', () => ({
  useCatalog: () => ({
    catalog: [],
    selectedItem: null,
    catalogCount: 0,
    addCatalogItem: vi.fn(),
    selectCatalogItem: vi.fn(),
    removeCatalogItem: vi.fn(),
    clearCatalog: vi.fn(),
    downloadImage: vi.fn(),
  })
}))

// Mock image analysis functions
vi.mock('@/lib/image-analyzer', () => ({
  analyzeGarmentImage: vi.fn().mockResolvedValue('Red cotton t-shirt'),
  analyzePersonImage: vi.fn().mockResolvedValue('Adult male in casual pose')
}))

// Mock watermark function
vi.mock('@/lib/watermark', () => ({
  applyIntelligentWatermark: vi.fn().mockImplementation((base64) => Promise.resolve(base64))
}))

describe('useFashionApp Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset fetch mock
    global.fetch = vi.fn()
  })

  describe('Initial State', () => {
    it('should initialize with default owner mode', () => {
      const { result } = renderHook(() => useFashionApp())

      expect(result.current.mode).toBe('owner')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.uploadedImages).toEqual([])
      expect(result.current.messages).toEqual([])
      expect(result.current.inputValue).toBe('')
      expect(result.current.isInputDisabled).toBe(false)
    })

    it('should have empty catalog state initially', () => {
      const { result } = renderHook(() => useFashionApp())

      expect(result.current.catalog).toEqual([])
      expect(result.current.selectedCatalogItem).toBe(null)
      expect(result.current.catalogCount).toBe(0)
    })
  })

  describe('Mode Switching', () => {
    it('should switch from owner to customer mode', () => {
      const { result } = renderHook(() => useFashionApp())

      act(() => {
        result.current.setMode('customer')
      })

      expect(result.current.mode).toBe('customer')
    })

    it('should reset state when switching modes', () => {
      const { result } = renderHook(() => useFashionApp())

      // Add some state first
      act(() => {
        result.current.setInputValue('test message')
      })

      expect(result.current.inputValue).toBe('test message')

      // Switch mode
      act(() => {
        result.current.setMode('customer')
      })

      // State should be reset except inputValue (not reset in setMode)
      expect(result.current.uploadedImages).toEqual([])
      expect(result.current.messages).toEqual([])
      expect(result.current.error).toBe(null)
    })
  })

  describe('Image Upload', () => {
    it('should upload model image successfully', async () => {
      const { result } = renderHook(() => useFashionApp())

      const mockFile = new File(['test'], 'model.jpg', { type: 'image/jpeg' })

      await act(async () => {
        await result.current.uploadImage(mockFile, 'model')
      })

      expect(result.current.uploadedImages).toHaveLength(1)
      expect(result.current.uploadedImages[0].type).toBe('model')
      expect(result.current.uploadedImages[0].file).toBe(mockFile)
      expect(result.current.uploadedImages[0].preview).toBe('mock-object-url')
    })

    it('should upload garment image successfully', async () => {
      const { result } = renderHook(() => useFashionApp())

      const mockFile = new File(['test'], 'garment.jpg', { type: 'image/jpeg' })

      await act(async () => {
        await result.current.uploadImage(mockFile, 'garment')
      })

      expect(result.current.uploadedImages).toHaveLength(1)
      expect(result.current.uploadedImages[0].type).toBe('garment')
    })

    it('should handle multiple image uploads', async () => {
      const { result } = renderHook(() => useFashionApp())

      const modelFile = new File(['test'], 'model.jpg', { type: 'image/jpeg' })
      const garmentFile = new File(['test'], 'garment.jpg', { type: 'image/jpeg' })

      await act(async () => {
        await result.current.uploadImage(modelFile, 'model')
      })

      await act(async () => {
        await result.current.uploadImage(garmentFile, 'garment')
      })

      expect(result.current.uploadedImages).toHaveLength(2)
    })
  })

  describe('Image Removal', () => {
    it('should remove image by id', async () => {
      const { result } = renderHook(() => useFashionApp())

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await act(async () => {
        await result.current.uploadImage(mockFile, 'model')
      })

      const imageId = result.current.uploadedImages[0].id

      act(() => {
        result.current.removeImage(imageId)
      })

      expect(result.current.uploadedImages).toHaveLength(0)
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url')
    })

    it('should clear all images', async () => {
      const { result } = renderHook(() => useFashionApp())

      const file1 = new File(['test'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['test'], 'test2.jpg', { type: 'image/jpeg' })

      await act(async () => {
        await result.current.uploadImage(file1, 'model')
      })

      await act(async () => {
        await result.current.uploadImage(file2, 'garment')
      })

      expect(result.current.uploadedImages).toHaveLength(2)

      act(() => {
        result.current.clearImages()
      })

      expect(result.current.uploadedImages).toHaveLength(0)
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
    })
  })

  describe('Message Sending', () => {
    it('should create user message with timestamp', async () => {
      const { result } = renderHook(() => useFashionApp())

      // Mock successful API response
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ story: 'Test response', imagePrompt: 'Test prompt' })
      })

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      const userMessage = result.current.messages[0]
      expect(userMessage.role).toBe('user')
      expect(userMessage.content).toBe('Hello')
      expect(userMessage.timestamp).toBeDefined()
      expect(typeof userMessage.timestamp).toBe('string')
    })

    it('should create assistant message with timestamp', async () => {
      const { result } = renderHook(() => useFashionApp())

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ story: 'AI response', imagePrompt: '' })
      })

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2)
      })

      const assistantMessage = result.current.messages[1]
      expect(assistantMessage.role).toBe('assistant')
      expect(assistantMessage.content).toBe('AI response')
      expect(assistantMessage.timestamp).toBeDefined()
    })

    it('should update messages array correctly', async () => {
      const { result } = renderHook(() => useFashionApp())

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ story: 'Response', imagePrompt: '' })
      })

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Error Handling', () => {
    it('should set error message on API failure', async () => {
      const { result } = renderHook(() => useFashionApp())

      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.isLoading).toBe(false)
    })

    it('should clear error when requested', async () => {
      const { result } = renderHook(() => useFashionApp())

      ;(global.fetch as any).mockRejectedValueOnce(new Error('Test error'))

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      expect(result.current.error).toBeTruthy()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })

    it('should handle missing images error in catalog generation', async () => {
      const { result } = renderHook(() => useFashionApp())

      await act(async () => {
        await result.current.generateCatalog()
      })

      expect(result.current.error).toBeTruthy()
      // Error message is in Spanish: "Debes subir tanto la imagen del modelo como de la prenda"
      expect(result.current.error).toContain('imagen')
    })
  })

  describe('Input Control', () => {
    it('should update input value', () => {
      const { result } = renderHook(() => useFashionApp())

      act(() => {
        result.current.setInputValue('New message')
      })

      expect(result.current.inputValue).toBe('New message')
    })

    it('should clear input value after sending message', async () => {
      const { result } = renderHook(() => useFashionApp())

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ story: 'Response', imagePrompt: '' })
      })

      act(() => {
        result.current.setInputValue('Test')
      })

      expect(result.current.inputValue).toBe('Test')

      await act(async () => {
        await result.current.sendMessage('Test')
      })

      expect(result.current.inputValue).toBe('')
    })
  })
})
