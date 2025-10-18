# Fashion Try-On - AI-Powered Catalog Generator

A Next.js application that uses Google Gemini AI to generate professional fashion catalog images. Upload a model photo and a garment, and let AI create stunning catalog images with intelligent watermarking.

---

## Features

- AI-powered catalog image generation using Google Gemini 2.5 Flash
- Intelligent watermarking with "Vintage de Liz" branding
- Client-side image storage (download to your device)
- Temporary gallery (last 10 items in browser)
- Responsive design with modern UI
- 96.7% test coverage (89/92 tests passing)

---

## Environment Setup

### Prerequisites

- Node.js 20 or later
- pnpm package manager
- Google Generative AI API Key

### Getting Your Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" (or use an existing one)
4. Copy the generated API key
5. Keep it secure - you'll need it for the next step

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fashion-try-on
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local and replace the placeholder with your real API key
   # GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the Fashion Try-On app

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google Generative AI API key | Yes |

**Important:** Never commit `.env.local` to git. It's already in `.gitignore` for your protection.

---

## Deploy to Vercel

The easiest way to deploy this Next.js app is using the Vercel Platform.

### Pre-Deployment Checklist

- [ ] You have a Google Generative AI API key
- [ ] You have a GitHub account (or GitLab/Bitbucket)
- [ ] You have pushed your code to a git repository
- [ ] You have a Vercel account (free tier works)

### Deployment Steps

1. **Connect to Vercel**
   - Visit [Vercel](https://vercel.com/new)
   - Sign in with your GitHub account
   - Click "Import Project"
   - Select your `fashion-try-on` repository

2. **Configure Environment Variables**
   - In the "Configure Project" screen:
     - Click "Environment Variables"
     - Add new variable:
       - **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
       - **Value:** [paste your Google AI API key]
     - Select "Production", "Preview", and "Development" environments
     - Click "Add"

3. **Deploy**
   - Vercel will auto-detect Next.js settings from `vercel.json`
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

4. **Post-Deployment Validation**
   - Click on the generated deployment URL
   - Upload a model photo and a garment photo
   - Click "Generar Catálogo"
   - Verify image generates successfully (should take <10 seconds)
   - Test download functionality (click download button on generated image)

### Deployment Configuration

The `vercel.json` file contains optimal settings:
- **Build Command:** `pnpm build` (Turbopack)
- **Framework:** Next.js (auto-detected)
- **Region:** US East (Virginia) - Low latency to Google AI API
- **Package Manager:** pnpm (for faster builds)

### Updating Your Deployment

Every push to your `main` branch will automatically trigger a new deployment on Vercel.

---

## Using the Application

### Upload Images

1. **Upload Model Photo**
   - Click "Click para subir imagen" in the "Foto del Modelo" section
   - Select a photo of a person (model)
   - Image preview will appear

2. **Upload Garment Photo**
   - Click "Click para subir imagen" in the "Foto de la Prenda" section
   - Select a photo of the clothing item you want to showcase
   - Image preview will appear

### Generate Catalog

3. **Generate Catalog Image**
   - Once both images are uploaded, the "Generar Catálogo" button will appear
   - Click the button
   - Wait 5-10 seconds while AI generates the image
   - The generated image will appear in the gallery below

### Manage Your Images

4. **Download Images**
   - Click the download button (⬇️) on any catalog item
   - Image will save to your device's Downloads folder
   - Filename format: `catalog-{title}-{id}.png`

5. **Gallery Features**
   - **Temporary Storage:** Your last 10 images are saved in your browser
   - **Favorites:** Click the heart icon to mark favorites
   - **Remove:** Click the trash icon to remove an item from the gallery
   - **Clear All:** Click "Limpiar Catálogo" to remove all items

### Image Storage Explanation

**Where are my images saved?**
- **Permanent:** Images you download are saved to your device (Downloads folder)
- **Temporary:** The gallery shows your last 10 items stored in your browser's localStorage
- **Server:** Images are never stored on the server (privacy-first approach)

**Gallery Limitations:**
- Maximum 10 items in gallery
- When you generate the 11th item, the oldest is automatically removed
- Download important images to keep them permanently

---

## Frequently Asked Questions (FAQ)

### General Questions

**Q: Where are my generated images saved?**
A: Images are saved to your device when you click the download button. The gallery shows your last 10 items temporarily in your browser. Images are never stored on the server for privacy.

**Q: How do I download an image?**
A: Click the download button (⬇️ icon) on any catalog item in the gallery. The image will save to your Downloads folder.

**Q: Why is my gallery limited to 10 items?**
A: Browser localStorage has size limits (~5-10MB per domain). To prevent quota issues, we automatically keep only the 10 most recent items. Download important images to save them permanently.

**Q: Can I generate images in different sizes or aspect ratios?**
A: Currently, all images are generated in the default aspect ratio. Future versions may support custom aspect ratios (1:1, 16:9, 9:16, etc.).

### Troubleshooting

**Q: Image generation fails with "Error generating image"**
A: Check the following:
1. Is your Google AI API key valid? Test it at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Have you exceeded your API quota? Check usage in Google AI Studio
3. Are both images uploaded correctly? Try re-uploading
4. Check browser console (F12) for detailed error messages

**Q: Build fails during deployment**
A: Common causes:
1. Missing environment variable - Add `GOOGLE_GENERATIVE_AI_API_KEY` in Vercel settings
2. Node version mismatch - Ensure Vercel uses Node 20+
3. TypeScript errors - Run `pnpm build` locally to identify issues

**Q: Images not downloading**
A: Check the following:
1. Browser popup blocker - Allow downloads from your site
2. Storage quota - Clear browser cache if running low on space
3. Try a different browser (Chrome, Firefox, Safari all supported)

**Q: "Storage quota exceeded" error**
A: Your browser's localStorage is full:
1. Download important images first
2. Click "Limpiar Catálogo" to clear the gallery
3. Close other tabs that might use localStorage
4. Clear browser cache

### Performance

**Q: How long does image generation take?**
A: Typically 5-10 seconds. The stable Gemini model (`gemini-2.5-flash-image`) is optimized for low latency.

**Q: Can I generate multiple images at once?**
A: Currently, the app generates one image at a time. You can generate multiple images sequentially.

**Q: Does the app work offline?**
A: No, image generation requires an internet connection to access the Google Gemini API.

---

## Development

### Available Scripts

```bash
pnpm dev          # Start development server (with Turbopack)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once (CI mode)
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Generate coverage report
```

### Tech Stack

- **Framework:** Next.js 15.5.3 (App Router)
- **React:** 19.1.0
- **AI Provider:** Google Gemini (`gemini-2.5-flash-image`)
- **AI SDK:** @ai-sdk/google ^2.0.14
- **Package Manager:** pnpm
- **Build Tool:** Turbopack
- **Testing:** Vitest + Testing Library
- **Styling:** Tailwind CSS 4

### Project Structure

```
fashion-try-on/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-image/    # AI image generation endpoint
│   │   │   ├── generate-catalog/  # Catalog description generation
│   │   │   └── chat-catalog/      # Chat functionality
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── fashion/               # Main app components
│   ├── hooks/
│   │   ├── useFashionApp.ts       # Main business logic
│   │   └── useCatalog.ts          # Catalog management + download
│   └── lib/
│       ├── image-analyzer.ts      # AI image analysis
│       ├── watermark.ts           # Watermark generation
│       └── prompts.ts             # AI prompts
├── .env.example                   # Environment variable template
├── vercel.json                    # Vercel deployment config
└── README.md
```

### Running Tests

```bash
# Run all tests
pnpm test:run

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/__tests__/hooks/useFashionApp.test.ts
```

**Test Results:**
- 92 total tests
- 89 passing (96.7%)
- 3 skipped
- ~80% code coverage

---

## Security

### API Key Security

- Never commit `.env.local` to git (it's in `.gitignore`)
- Use `.env.example` for documentation only (placeholder values)
- Store real API keys in Vercel environment variables (encrypted)
- Rotate API keys if accidentally exposed

### Image Privacy

- Images are never stored on the server
- Temporary gallery uses browser localStorage (local only)
- Downloaded images go to user's device
- No data sent to third parties (except Google AI for generation)

---

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check the FAQ section above
- Review the troubleshooting guide

---

## License

This project is private and proprietary.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Google Gemini AI](https://ai.google.dev)
- Deployed on [Vercel](https://vercel.com)
- Designed for "Vintage de Liz"

---

**Version:** 1.0.0
**Last Updated:** 2025-10-18
**Status:** Production Ready ✅
