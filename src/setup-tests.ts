import '@testing-library/jest-dom'
import { beforeAll, afterEach, vi } from 'vitest'

// Mock global objects that don't exist in happy-dom

// Mock File API
global.File = class MockFile extends Blob {
  name: string
  lastModified: number

  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    super(bits, options)
    this.name = name
    this.lastModified = options?.lastModified || Date.now()
  }
} as any

// Mock FileReader
global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null

  readAsDataURL(blob: Blob) {
    // Simulate async read
    setTimeout(() => {
      // Create a mock base64 string
      this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      if (this.onload) {
        this.onload.call(this as any, {} as ProgressEvent<FileReader>)
      }
    }, 0)
  }

  readAsArrayBuffer(blob: Blob) {
    setTimeout(() => {
      this.result = new ArrayBuffer(0)
      if (this.onload) {
        this.onload.call(this as any, {} as ProgressEvent<FileReader>)
      }
    }, 0)
  }
} as any

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {} as Crypto
}
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = (() => Math.random().toString(36).substring(2, 15)) as typeof crypto.randomUUID
}

// Mock fetch API
global.fetch = vi.fn()

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Setup before all tests
beforeAll(() => {
  // Add any global setup here
})
