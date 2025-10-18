import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeGarmentImage, analyzePersonImage, extractDominantColors } from '@/lib/image-analyzer'

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn()
}))

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mocked-model')
}))

import { generateText } from 'ai'

describe('Image Analyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeGarmentImage', () => {
    it('should analyze garment image and return detailed description', async () => {
      const mockResponse = {
        text: 'Red cotton t-shirt with round neck, short sleeves, and casual fit. Made from soft breathable fabric with clean stitching.'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const result = await analyzeGarmentImage('mock-base64-image')

      expect(result).toBe(mockResponse.text)
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-model',
          temperature: 0.3
        })
      )
    })

    it('should return fallback description on error', async () => {
      ;(generateText as any).mockRejectedValueOnce(new Error('API Error'))

      const result = await analyzeGarmentImage('mock-base64-image')

      expect(result).toBe('Prenda de alta calidad con características específicas y detalles únicos')
    })

    it('should include base64 image in request', async () => {
      const mockResponse = { text: 'Blue jeans' }
      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const base64Image = 'test-image-base64'
      await analyzeGarmentImage(base64Image)

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: 'image',
                  image: `data:image/png;base64,${base64Image}`
                })
              ])
            })
          ])
        })
      )
    })

    it('should trim whitespace from response', async () => {
      const mockResponse = { text: '  Red cotton t-shirt  \n' }
      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const result = await analyzeGarmentImage('mock-base64')

      expect(result).toBe('Red cotton t-shirt')
    })
  })

  describe('analyzePersonImage', () => {
    it('should analyze person image and return detailed description', async () => {
      const mockResponse = {
        text: 'Adult male with medium skin tone, short black hair, casual pose, athletic build, standing upright.'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const result = await analyzePersonImage('mock-base64-person')

      expect(result).toBe(mockResponse.text)
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-model',
          temperature: 0.3
        })
      )
    })

    it('should return fallback description on error', async () => {
      ;(generateText as any).mockRejectedValueOnce(new Error('Network Error'))

      const result = await analyzePersonImage('mock-base64-person')

      expect(result).toBe('Persona con características únicas, rasgos distintivos y proporciones específicas')
    })

    it('should include base64 image in request', async () => {
      const mockResponse = { text: 'Young woman' }
      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const base64Image = 'person-image-base64'
      await analyzePersonImage(base64Image)

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: 'image',
                  image: `data:image/png;base64,${base64Image}`
                })
              ])
            })
          ])
        })
      )
    })

    it('should trim whitespace from response', async () => {
      const mockResponse = { text: '\n  Adult male in casual pose  ' }
      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const result = await analyzePersonImage('mock-base64')

      expect(result).toBe('Adult male in casual pose')
    })
  })

  describe('extractDominantColors', () => {
    it('should extract and return array of dominant colors', async () => {
      const mockResponse = {
        text: 'azul marino, blanco, gris'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const result = await extractDominantColors('mock-base64-image')

      expect(result).toEqual(['azul marino', 'blanco', 'gris'])
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-model',
          temperature: 0.2
        })
      )
    })

    it('should limit results to 3 colors maximum', async () => {
      const mockResponse = {
        text: 'rojo, azul, verde, amarillo, negro'
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const result = await extractDominantColors('mock-base64-image')

      expect(result).toHaveLength(3)
      expect(result).toEqual(['rojo', 'azul', 'verde'])
    })

    it('should return fallback color on error', async () => {
      ;(generateText as any).mockRejectedValueOnce(new Error('API Error'))

      const result = await extractDominantColors('mock-base64-image')

      expect(result).toEqual(['color específico'])
    })

    it('should trim whitespace from each color', async () => {
      const mockResponse = {
        text: '  rojo  ,  blanco ,negro  '
      }

      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const result = await extractDominantColors('mock-base64-image')

      expect(result).toEqual(['rojo', 'blanco', 'negro'])
    })

    it('should include base64 image in request', async () => {
      const mockResponse = { text: 'azul, rojo, verde' }
      ;(generateText as any).mockResolvedValueOnce(mockResponse)

      const base64Image = 'color-test-base64'
      await extractDominantColors(base64Image)

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: 'image',
                  image: `data:image/png;base64,${base64Image}`
                })
              ])
            })
          ])
        })
      )
    })
  })
})
