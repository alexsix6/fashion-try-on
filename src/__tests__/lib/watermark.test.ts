import { describe, it, expect, vi, beforeEach } from 'vitest'
import { applyIntelligentWatermark, applyWatermarkBatch, previewWatermark } from '@/lib/watermark'

describe('Watermark System', () => {
  let mockCanvasContext: any
  let mockCanvas: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock canvas context
    mockCanvasContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(400).fill(128) // Medium brightness
      })),
      globalAlpha: 1.0
    }

    // Create mock canvas
    mockCanvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(() => mockCanvasContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-watermarked-image')
    }

    // Mock document.createElement to return our mock canvas
    global.document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas
      }
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn()
        }
      }
      return {} as any
    }) as any

    global.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      width = 800
      height = 600
      crossOrigin = ''

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload()
          }
        }, 0)
      }
    } as any

    global.Blob = class MockBlob {
      constructor(public parts: any[], public options?: any) {}
    } as any

    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  describe('applyIntelligentWatermark', () => {
    it('should apply watermark with default options', async () => {
      const result = await applyIntelligentWatermark('test-base64-image')

      expect(result).toBe('mock-watermarked-image')
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should apply watermark with custom position', async () => {
      const result = await applyIntelligentWatermark('test-base64-image', {
        position: 'top-left'
      })

      expect(result).toBe('mock-watermarked-image')
    })

    it('should apply watermark with custom size', async () => {
      const result = await applyIntelligentWatermark('test-base64-image', {
        size: 'large'
      })

      expect(result).toBe('mock-watermarked-image')
    })

    it('should apply watermark with custom opacity', async () => {
      const result = await applyIntelligentWatermark('test-base64-image', {
        opacity: 0.5
      })

      expect(result).toBe('mock-watermarked-image')
    })

    it('should apply watermark with different styles', async () => {
      const minimalResult = await applyIntelligentWatermark('test-base64', {
        style: 'minimal'
      })
      expect(minimalResult).toBe('mock-watermarked-image')

      const fullResult = await applyIntelligentWatermark('test-base64', {
        style: 'full'
      })
      expect(fullResult).toBe('mock-watermarked-image')

      const isotipoResult = await applyIntelligentWatermark('test-base64', {
        style: 'isotipo'
      })
      expect(isotipoResult).toBe('mock-watermarked-image')
    })

    it('should handle image loading error', async () => {
      // Override Image mock to trigger error
      global.Image = class MockImageError {
        onload: (() => void) | null = null
        onerror: ((error: Error) => void) | null = null
        src = ''
        crossOrigin = ''

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Image load failed'))
            }
          }, 0)
        }
      } as any

      await expect(
        applyIntelligentWatermark('invalid-base64')
      ).rejects.toThrow('Error loading base image')
    })

    it('should test all position options', async () => {
      const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'] as const

      for (const position of positions) {
        const result = await applyIntelligentWatermark('test-base64', { position })
        expect(result).toBe('mock-watermarked-image')
      }
    })
  })

  describe('applyWatermarkBatch', () => {
    it('should apply watermark to multiple images', async () => {
      const images = ['image1-base64', 'image2-base64', 'image3-base64']

      const results = await applyWatermarkBatch(images)

      expect(results).toHaveLength(3)
      expect(results.every(r => r === 'mock-watermarked-image')).toBe(true)
    })

    it('should handle empty array', async () => {
      const results = await applyWatermarkBatch([])

      expect(results).toEqual([])
    })

    it('should apply custom options to all images', async () => {
      const images = ['image1-base64', 'image2-base64']

      const results = await applyWatermarkBatch(images, {
        position: 'top-left',
        size: 'small',
        opacity: 0.6
      })

      expect(results).toHaveLength(2)
    })
  })

  describe('previewWatermark', () => {
    it('should generate watermark preview with default options', () => {
      const preview = previewWatermark()

      expect(preview).toContain('<svg')
      expect(preview).toContain('VINTAGE DE LIZ')
    })

    it('should generate watermark preview with minimal style', () => {
      const preview = previewWatermark('minimal', 'medium')

      expect(preview).toContain('<svg')
      expect(preview).toContain('VINTAGE DE LIZ')
    })

    it('should generate watermark preview with isotipo style', () => {
      const preview = previewWatermark('isotipo', 'small')

      expect(preview).toContain('<svg')
    })

    it('should generate watermark preview with different sizes', () => {
      const small = previewWatermark('full', 'small')
      const medium = previewWatermark('full', 'medium')
      const large = previewWatermark('full', 'large')

      expect(small).toContain('width="120"')
      expect(medium).toContain('width="180"')
      expect(large).toContain('width="240"')
    })
  })
})
