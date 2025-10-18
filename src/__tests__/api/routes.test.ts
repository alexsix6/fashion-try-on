import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as chatCatalogPOST } from '@/app/api/chat-catalog/route'
import { POST as generateCatalogPOST } from '@/app/api/generate-catalog/route'
import { POST as generateImagePOST } from '@/app/api/generate-image/route'
import { NextRequest } from 'next/server'

// Mock AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn()
}))

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mocked-model')
}))

// Mock image-sanitizer
vi.mock('@/lib/image-sanitizer', () => ({
  sanitizeModelImage: vi.fn((image) => Promise.resolve(image))
}))

import { generateText } from 'ai'

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/chat-catalog', () => {
    it('should process catalog chat request successfully', async () => {
      const mockCatalogItems = [
        {
          id: 'item-1',
          title: 'Red Dress',
          description: 'Beautiful red evening dress',
          metadata: {
            garmentType: 'dress',
            colors: ['red'],
            style: 'formal',
            gender: 'woman',
            season: 'all-season',
            occasion: 'evening'
          }
        }
      ]

      const mockResponse = {
        text: 'I found a red dress that matches your search!'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const request = new NextRequest('http://localhost:3000/api/chat-catalog', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: 'Show me red dresses',
          catalogItems: mockCatalogItems
        })
      })

      const response = await chatCatalogPOST(request)
      const data = await response.json()

      expect(data.response).toBe(mockResponse.text)
      expect(data.highlightedIds).toBeDefined()
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-model',
          prompt: expect.stringContaining('Show me red dresses')
        })
      )
    })

    it('should extract mentioned IDs from response', async () => {
      const mockCatalogItems = [
        {
          id: 'dress-123',
          title: 'Red Dress',
          description: 'Beautiful dress',
          metadata: {
            garmentType: 'dress',
            colors: ['red'],
            style: 'formal',
            gender: 'woman',
            season: 'all-season',
            occasion: 'evening'
          }
        },
        {
          id: 'shirt-456',
          title: 'Blue Shirt',
          description: 'Casual shirt',
          metadata: {
            garmentType: 'shirt',
            colors: ['blue'],
            style: 'casual',
            gender: 'man',
            season: 'all-season',
            occasion: 'daily'
          }
        }
      ]

      const mockResponse = {
        text: 'I recommend dress-123 for your evening event'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const request = new NextRequest('http://localhost:3000/api/chat-catalog', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: 'Formal dress for evening',
          catalogItems: mockCatalogItems
        })
      })

      const response = await chatCatalogPOST(request)
      const data = await response.json()

      expect(data.highlightedIds).toContain('dress-123')
      expect(data.highlightedIds).not.toContain('shirt-456')
    })

    it('should handle API errors gracefully', async () => {
      ;(generateText as any).mockRejectedValueOnce(new Error('API Error'))

      const request = new NextRequest('http://localhost:3000/api/chat-catalog', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: 'test',
          catalogItems: []
        })
      })

      const response = await chatCatalogPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Error processing chat request')
    })
  })

  describe('POST /api/generate-catalog', () => {
    it('should generate catalog description from image', async () => {
      const mockResponse = {
        text: 'Elegant red dress with sophisticated design and modern cut.'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const request = new NextRequest('http://localhost:3000/api/generate-catalog', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'catalog',
          isStart: true,
          generatedImage: 'base64-generated-image',
          userMessage: '',
          conversationHistory: []
        })
      })

      const response = await generateCatalogPOST(request)
      const data = await response.json()

      expect(data.story).toBe(mockResponse.text)
      expect(data.imagePrompt).toBe('')
      expect(generateText).toHaveBeenCalled()
    })

    it('should handle catalog mode without generated image', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-catalog', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'catalog',
          isStart: true,
          generatedImage: null,
          userMessage: '',
          conversationHistory: []
        })
      })

      const response = await generateCatalogPOST(request)
      const data = await response.json()

      expect(data.story).toContain('elegante prenda')
      expect(data.imagePrompt).toBe('')
    })

    it('should handle conversation mode', async () => {
      const mockResponse = {
        text: 'That dress would look great with these accessories!'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const request = new NextRequest('http://localhost:3000/api/generate-catalog', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'catalog',
          isStart: false,
          userMessage: 'What accessories go with this?',
          conversationHistory: [
            { role: 'user', content: 'Show me the red dress' },
            { role: 'assistant', content: 'Here is a beautiful red dress' }
          ]
        })
      })

      const response = await generateCatalogPOST(request)
      const data = await response.json()

      expect(data.story).toBe(mockResponse.text)
    })

    it('should return fallback on API error', async () => {
      ;(generateText as any).mockRejectedValueOnce(new Error('AI Error'))

      const request = new NextRequest('http://localhost:3000/api/generate-catalog', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'catalog',
          isStart: true,
          generatedImage: 'test-image',
          userMessage: '',
          conversationHistory: []
        })
      })

      const response = await generateCatalogPOST(request)
      const data = await response.json()

      expect(data.story).toContain('elegante prenda')
      expect(data.imagePrompt).toBe('')
    })
  })

  describe('POST /api/generate-image', () => {
    it('should generate image successfully with retry logic', async () => {
      const mockFile = {
        base64Data: 'generated-image-base64',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      ;(generateText as any).mockResolvedValueOnce({
        files: [mockFile]
      })

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          imagePrompt: 'Generate fashion image',
          modelImage: 'model-base64',
          garmentImage: 'garment-base64',
          mode: 'catalog',
          garmentDescription: 'Red cotton dress'
        })
      })

      const response = await generateImagePOST(request)
      const data = await response.json()

      expect(data.image).toMatchObject({
        base64Data: mockFile.base64Data,
        mediaType: mockFile.mediaType
      })
      expect(data.sanitizedModelImage).toBeDefined()
    })

    it('should handle tryon mode correctly', async () => {
      const mockFile = {
        base64Data: 'tryon-image-base64',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      ;(generateText as any).mockResolvedValueOnce({
        files: [mockFile]
      })

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          imagePrompt: 'Generate try-on',
          modelImage: 'person-base64',
          garmentImage: 'garment-base64',
          mode: 'tryon',
          garmentDescription: 'Blue jeans',
          personDescription: 'Young adult with casual style'
        })
      })

      const response = await generateImagePOST(request)
      const data = await response.json()

      expect(data.image).toMatchObject({
        base64Data: mockFile.base64Data,
        mediaType: mockFile.mediaType
      })
    })

    it('should retry on failure and eventually succeed', async () => {
      const mockFile = {
        base64Data: 'success-after-retry',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      ;(generateText as any)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({ files: [mockFile] })

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          imagePrompt: 'Test retry',
          modelImage: 'model-base64',
          garmentImage: 'garment-base64',
          mode: 'catalog'
        })
      })

      const response = await generateImagePOST(request)
      const data = await response.json()

      expect(data.image).toMatchObject({
        base64Data: mockFile.base64Data,
        mediaType: mockFile.mediaType
      })
      expect(generateText).toHaveBeenCalledTimes(2)
    })

    it('should handle complete failure after retries', async () => {
      ;(generateText as any).mockRejectedValue(new Error('Persistent failure'))

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          imagePrompt: 'Test failure',
          modelImage: 'model-base64',
          garmentImage: 'garment-base64',
          mode: 'catalog'
        })
      })

      const response = await generateImagePOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Error generating image')
    })

    it('should enforce safety settings', async () => {
      const mockFile = {
        base64Data: 'safe-image',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      ;(generateText as any).mockResolvedValueOnce({
        files: [mockFile]
      })

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          imagePrompt: 'Generate image',
          modelImage: 'model-base64',
          garmentImage: 'garment-base64',
          mode: 'catalog'
        })
      })

      await generateImagePOST(request)

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          providerOptions: expect.objectContaining({
            google: expect.objectContaining({
              safetySettings: expect.any(Array)
            })
          })
        })
      )
    })
  })
})
