'use client'

import { Palette } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md shrink-0">
        <div className="px-4 py-3 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-white purple-glow flex items-center gap-3">
                <Palette className="w-8 h-8 text-purple-400" />
                Fashion Try-On AI
              </h1>
              <p className="text-xs md:text-sm text-purple-200 mt-1 hidden sm:block">
                Generador de catálogos y prueba virtual impulsado por IA
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
