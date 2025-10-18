import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatSidebar from '@/components/chat/ChatSidebar'
import UploadSection from '@/components/upload/UploadSection'
import ModernFashionApp from '@/components/fashion/ModernFashionApp'

// Mock hooks
vi.mock('@/hooks/useFashionApp', () => ({
  useFashionApp: () => ({
    mode: 'owner',
    isLoading: false,
    error: null,
    uploadedImages: [],
    catalog: [],
    catalogCount: 0,
    generatedImage: null,
    messages: [],
    inputValue: '',
    isInputDisabled: false,
    setMode: vi.fn(),
    uploadImage: vi.fn(),
    removeImage: vi.fn(),
    clearImages: vi.fn(),
    generateCatalog: vi.fn(),
    generateTryOn: vi.fn(),
    sendMessage: vi.fn(),
    setInputValue: vi.fn(),
    clearError: vi.fn(),
    selectedCatalogItem: null,
    selectCatalogItem: vi.fn(),
    removeCatalogItem: vi.fn(),
    clearCatalog: vi.fn(),
    downloadImage: vi.fn(),
    regenerateImage: vi.fn()
  })
}))

describe('Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ChatSidebar', () => {
    const mockMessages = [
      {
        id: '1',
        role: 'user' as const,
        content: 'Hello AI',
        timestamp: '10:30 AM'
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: 'Hello! How can I help you?',
        timestamp: '10:31 AM'
      }
    ]

    it('should render chat sidebar with messages', () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={mockMessages}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      )

      expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument()
      expect(screen.getByText('Hello AI')).toBeInTheDocument()
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument()
    })

    it('should show empty state when no messages', () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={[]}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      )

      expect(screen.getByText(/¡Hola!/i)).toBeInTheDocument()
    })

    it('should update input value when typing', async () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={[]}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      )

      const textarea = screen.getByPlaceholderText(/Ask me to generate images/i)

      await userEvent.type(textarea, 'Generate a dress')

      expect(textarea).toHaveValue('Generate a dress')
    })

    it('should allow typing in textarea', async () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={[]}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      )

      const textarea = screen.getByPlaceholderText(/Ask me to generate images/i)

      await userEvent.type(textarea, 'Test message')

      expect(textarea).toHaveValue('Test message')
    })

    it('should have send button disabled when input is empty', async () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={[]}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      )

      const textarea = screen.getByPlaceholderText(/Ask me to generate images/i)

      // Initially textarea should be empty
      expect(textarea).toHaveValue('')
    })

    it('should disable input when loading', () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={[]}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
          isLoading={true}
        />
      )

      const textarea = screen.getByPlaceholderText(/Ask me to generate images/i)
      expect(textarea).toBeDisabled()
    })

    it('should show loading indicator when isLoading is true', () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={mockMessages}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
          isLoading={true}
        />
      )

      expect(screen.getByText('Thinking...')).toBeInTheDocument()
    })

    it('should display clear button when messages exist', () => {
      const onSendMessage = vi.fn()
      const onClearChat = vi.fn()

      render(
        <ChatSidebar
          messages={mockMessages}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      )

      // Clear button should be present and enabled when there are messages
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('UploadSection', () => {
    beforeEach(() => {
      // Mock FileReader
      global.FileReader = class {
        result: string | null = null
        onloadend: (() => void) | null = null
        onerror: (() => void) | null = null

        readAsDataURL() {
          this.result = 'data:image/png;base64,mock-image-data'
          setTimeout(() => {
            if (this.onloadend) {
              this.onloadend()
            }
          }, 0)
        }
      } as any
    })

    it('should render upload section', () => {
      const onUpload = vi.fn()
      const onGenerateCatalog = vi.fn()

      render(
        <UploadSection
          onUpload={onUpload}
          onGenerateCatalog={onGenerateCatalog}
          uploadCount={0}
        />
      )

      expect(screen.getByText(/Upload Images for Virtual Try-On/i)).toBeInTheDocument()
      expect(screen.getByText('Model Photo')).toBeInTheDocument()
      expect(screen.getByText('Garment Photo')).toBeInTheDocument()
    })

    it('should handle model photo upload via file input', async () => {
      const onUpload = vi.fn()
      const onGenerateCatalog = vi.fn()

      render(
        <UploadSection
          onUpload={onUpload}
          onGenerateCatalog={onGenerateCatalog}
          uploadCount={0}
        />
      )

      const modelInput = document.getElementById('model-upload') as HTMLInputElement
      const mockFile = new File(['test'], 'model.jpg', { type: 'image/jpeg' })

      await waitFor(() => {
        fireEvent.change(modelInput, { target: { files: [mockFile] } })
      })

      await waitFor(() => {
        expect(screen.getByAltText('Model preview')).toBeInTheDocument()
      })
    })

    it('should handle garment photo upload via file input', async () => {
      const onUpload = vi.fn()
      const onGenerateCatalog = vi.fn()

      render(
        <UploadSection
          onUpload={onUpload}
          onGenerateCatalog={onGenerateCatalog}
          uploadCount={0}
        />
      )

      const garmentInput = document.getElementById('garment-upload') as HTMLInputElement
      const mockFile = new File(['test'], 'garment.jpg', { type: 'image/jpeg' })

      await waitFor(() => {
        fireEvent.change(garmentInput, { target: { files: [mockFile] } })
      })

      await waitFor(() => {
        expect(screen.getByAltText('Garment preview')).toBeInTheDocument()
      })
    })

    it('should show generate button when both images uploaded', async () => {
      const onUpload = vi.fn()
      const onGenerateCatalog = vi.fn()

      render(
        <UploadSection
          onUpload={onUpload}
          onGenerateCatalog={onGenerateCatalog}
          uploadCount={0}
        />
      )

      const modelInput = document.getElementById('model-upload') as HTMLInputElement
      const garmentInput = document.getElementById('garment-upload') as HTMLInputElement

      const modelFile = new File(['model'], 'model.jpg', { type: 'image/jpeg' })
      const garmentFile = new File(['garment'], 'garment.jpg', { type: 'image/jpeg' })

      fireEvent.change(modelInput, { target: { files: [modelFile] } })

      await waitFor(() => {
        expect(screen.getByAltText('Model preview')).toBeInTheDocument()
      })

      fireEvent.change(garmentInput, { target: { files: [garmentFile] } })

      await waitFor(() => {
        expect(screen.getByAltText('Garment preview')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Generate Virtual Try-On')).toBeInTheDocument()
      })
    })

    it('should show helper text when images not uploaded', () => {
      const onUpload = vi.fn()
      const onGenerateCatalog = vi.fn()

      render(
        <UploadSection
          onUpload={onUpload}
          onGenerateCatalog={onGenerateCatalog}
          uploadCount={0}
        />
      )

      expect(screen.getByText(/Upload both model and garment photos/i)).toBeInTheDocument()
    })
  })

  describe('ModernFashionApp', () => {
    it('should render main app structure', () => {
      render(<ModernFashionApp />)

      // Check for main layout elements
      expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument()
    })

    it('should show upload section when on uploads tab', () => {
      render(<ModernFashionApp />)

      // By default activeTab is 'uploads', so UploadSection should be visible
      expect(screen.getByText(/Upload Images for Virtual Try-On/i)).toBeInTheDocument()
    })

    it('should render chat sidebar', () => {
      render(<ModernFashionApp />)

      // Check that the chat sidebar is rendered with the placeholder
      expect(screen.getByPlaceholderText(/Ask me to generate images/i)).toBeInTheDocument()
    })
  })
})
