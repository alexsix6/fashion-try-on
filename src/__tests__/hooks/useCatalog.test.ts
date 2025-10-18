import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCatalog } from '@/hooks/useCatalog'
import type { GeneratedImage } from '@/lib/types'

describe('useCatalog Hook', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      })
    }
  })()

  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage = localStorageMock as any
    localStorageMock.clear()
  })

  describe('Initial State', () => {
    it('should initialize with empty catalog', () => {
      const { result } = renderHook(() => useCatalog())

      expect(result.current.catalog).toEqual([])
      expect(result.current.selectedItem).toBe(null)
      expect(result.current.catalogCount).toBe(0)
    })
  })

  describe('Add Catalog Item', () => {
    it('should add item to catalog successfully', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'mock-base64-data',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      act(() => {
        result.current.addCatalogItem(
          'Red T-Shirt',
          'Beautiful red cotton t-shirt',
          mockImage,
          'model-base64',
          'garment-base64',
          ['casual', 'summer']
        )
      })

      expect(result.current.catalog).toHaveLength(1)
      expect(result.current.catalogCount).toBe(1)
      expect(result.current.catalog[0].title).toBe('Red T-Shirt')
      expect(result.current.catalog[0].description).toBe('Beautiful red cotton t-shirt')
      expect(result.current.catalog[0].image).toBe(mockImage)
    })

    it('should generate metadata from title and description', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'test',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      act(() => {
        result.current.addCatalogItem(
          'Vestido rojo formal',
          'Elegante vestido para mujer',
          mockImage,
          'model',
          'garment'
        )
      })

      const item = result.current.catalog[0]
      expect(item.metadata?.garmentType).toBe('vestido')
      expect(item.metadata?.colors).toContain('rojo')
      expect(item.metadata?.style).toBe('formal')
      expect(item.metadata?.gender).toBe('mujer')
    })
  })

  describe('Select Catalog Item', () => {
    it('should select catalog item', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'test',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      let addedItem: any

      act(() => {
        addedItem = result.current.addCatalogItem(
          'Test Item',
          'Description',
          mockImage,
          'model',
          'garment'
        )
      })

      act(() => {
        result.current.selectCatalogItem(addedItem)
      })

      expect(result.current.selectedItem).toBe(addedItem)
      expect(result.current.selectedItem?.title).toBe('Test Item')
    })

    it('should deselect item when passed null', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'test',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      let addedItem: any

      act(() => {
        addedItem = result.current.addCatalogItem(
          'Test Item',
          'Description',
          mockImage,
          'model',
          'garment'
        )
      })

      act(() => {
        result.current.selectCatalogItem(addedItem)
      })

      expect(result.current.selectedItem).toBeTruthy()

      act(() => {
        result.current.selectCatalogItem(null)
      })

      expect(result.current.selectedItem).toBe(null)
    })
  })

  describe('Remove Catalog Item', () => {
    it('should remove item from catalog', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'test',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      let itemId: string

      act(() => {
        const item = result.current.addCatalogItem(
          'Test Item',
          'Description',
          mockImage,
          'model',
          'garment'
        )
        itemId = item.id
      })

      expect(result.current.catalog).toHaveLength(1)

      act(() => {
        result.current.removeCatalogItem(itemId)
      })

      expect(result.current.catalog).toHaveLength(0)
      expect(result.current.catalogCount).toBe(0)
    })

    it('should deselect item if selected item is removed', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'test',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      let item: any

      act(() => {
        item = result.current.addCatalogItem(
          'Test Item',
          'Description',
          mockImage,
          'model',
          'garment'
        )
      })

      act(() => {
        result.current.selectCatalogItem(item)
      })

      expect(result.current.selectedItem).toBeTruthy()

      act(() => {
        result.current.removeCatalogItem(item.id)
      })

      expect(result.current.selectedItem).toBe(null)
    })
  })

  describe('Clear Catalog', () => {
    it('should clear all catalog items', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'test',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      act(() => {
        result.current.addCatalogItem('Item 1', 'Desc 1', mockImage, 'model', 'garment')
      })

      act(() => {
        result.current.addCatalogItem('Item 2', 'Desc 2', mockImage, 'model', 'garment')
      })

      act(() => {
        result.current.addCatalogItem('Item 3', 'Desc 3', mockImage, 'model', 'garment')
      })

      expect(result.current.catalog).toHaveLength(3)

      act(() => {
        result.current.clearCatalog()
      })

      expect(result.current.catalog).toHaveLength(0)
      expect(result.current.catalogCount).toBe(0)
      expect(result.current.selectedItem).toBe(null)
      expect(localStorage.removeItem).toHaveBeenCalledWith('fashion-catalog')
    })
  })

  describe('Download Image', () => {
    it('should create download link with correct attributes', () => {
      const { result } = renderHook(() => useCatalog())

      const mockImage: GeneratedImage = {
        base64Data: 'test-base64',
        mediaType: 'image/png',
        uint8ArrayData: new Uint8Array()
      }

      // Mock document methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      let item: any

      act(() => {
        item = result.current.addCatalogItem(
          'Test Item',
          'Description',
          mockImage,
          'model',
          'garment'
        )
      })

      act(() => {
        result.current.downloadImage(item, 'custom-filename.png')
      })

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.href).toContain('data:image/png;base64,test-base64')
      expect(mockLink.download).toBe('custom-filename.png')
      expect(mockLink.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()

      // Cleanup
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })
})
