'use client'

import { useState } from 'react';
import { FashionApp } from '@/components/fashion/FashionApp';

export function VintageLanding() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <FashionApp />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F4EC] via-[#F2D9D3] to-[#F7F4EC]">
      {/* Header con Logo */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Principal */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <svg width="60" height="60" viewBox="0 0 200 200" className="drop-shadow-lg">
                {/* Etiqueta orgánica */}
                <path 
                  d="M40,60 q10,-15 30,-15 h100 q20,0 30,15 v80 q0,18 -15,28 l-30,20 q-15,10 -30,0 l-30,-20 q-15,-10 -15,-28 z" 
                  fill="#7C2632"
                />
                {/* Ojal de etiqueta */}
                <circle cx="60" cy="75" r="4" fill="#F7F4EC"/>
                {/* Texto del logo */}
                <text x="100" y="110" textAnchor="middle" fontSize="24" fontWeight="700" fill="#F7F4EC" fontFamily="system-ui">V</text>
                <text x="100" y="135" textAnchor="middle" fontSize="12" fontWeight="600" fill="#F7F4EC" fontFamily="system-ui">LIZ</text>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#7C2632] tracking-wide">VINTAGE DE LIZ</h1>
              <p className="text-sm text-[#0E3B2E] opacity-80">Curaduría vintage con historia</p>
            </div>
          </div>

          {/* CTA Header */}
          <button
            onClick={() => setShowApp(true)}
            className="bg-[#7C2632] text-[#F7F4EC] px-6 py-3 rounded-full font-semibold hover:bg-[#8C3542] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Probar Try-On Virtual
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Contenido Principal */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="bg-[#0E3B2E] text-[#F7F4EC] px-4 py-2 rounded-full text-sm font-semibold">
                  🆕 Try-On Virtual con IA
                </span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold text-[#0E3B2E] leading-tight">
                Vintage auténtico
                <span className="block text-[#7C2632]">con tecnología</span>
                <span className="block text-[#0E3B2E]">del futuro</span>
              </h2>
              <p className="text-xl text-[#0E3B2E] opacity-80 leading-relaxed">
                Descubre piezas únicas con historia y pruébatelas virtualmente antes de comprar. 
                Nuestra IA revolucionaria te permite ver exactamente cómo te queda cada prenda vintage.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#0E3B2E]/10">
                <div className="w-12 h-12 bg-[#7C2632] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-[#0E3B2E] mb-2">Try-On Preciso</h3>
                <p className="text-sm text-[#0E3B2E] opacity-70">IA que preserva tu identidad exacta</p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#0E3B2E]/10">
                <div className="w-12 h-12 bg-[#0E3B2E] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-bold text-[#0E3B2E] mb-2">Curaduría Experta</h3>
                <p className="text-sm text-[#0E3B2E] opacity-70">Selección única con autenticidad garantizada</p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#0E3B2E]/10">
                <div className="w-12 h-12 bg-[#F2D9D3] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="font-bold text-[#0E3B2E] mb-2">Moda Sostenible</h3>
                <p className="text-sm text-[#0E3B2E] opacity-70">Segunda vida para piezas con historia</p>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowApp(true)}
                className="bg-[#7C2632] text-[#F7F4EC] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#8C3542] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                🚀 Comenzar Try-On Virtual
              </button>
              <button className="border-2 border-[#0E3B2E] text-[#0E3B2E] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#0E3B2E] hover:text-[#F7F4EC] transition-all duration-300">
                Ver Catálogo
              </button>
            </div>
          </div>

          {/* Visual/Demo */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#7C2632] to-[#0E3B2E] rounded-3xl p-8 shadow-2xl">
              <div className="bg-[#F7F4EC] rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-[#7C2632] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#F2D9D3] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#0E3B2E] rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-4 bg-[#F2D9D3] rounded w-3/4"></div>
                  <div className="h-32 bg-gradient-to-r from-[#F2D9D3] to-[#7C2632] rounded-xl opacity-80"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-[#0E3B2E] rounded w-1/3 opacity-60"></div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-[#7C2632] rounded-lg"></div>
                      <div className="w-8 h-8 bg-[#0E3B2E] rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#F2D9D3] rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#7C2632] rounded-full opacity-40 animate-pulse delay-1000"></div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="px-6 py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0E3B2E] mb-4">Cómo funciona el Try-On Virtual</h2>
            <p className="text-xl text-[#0E3B2E] opacity-80">Tecnología de IA avanzada para la experiencia vintage perfecta</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#7C2632] rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl text-[#F7F4EC]">📸</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0E3B2E]">1. Sube tu foto</h3>
              <p className="text-[#0E3B2E] opacity-70">
                Toma una foto clara y nuestra IA analizará tus características únicas para preservar tu identidad exacta.
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#0E3B2E] rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl text-[#F7F4EC]">👕</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0E3B2E]">2. Elige la prenda</h3>
              <p className="text-[#0E3B2E] opacity-70">
                Selecciona de nuestro catálogo curado de piezas vintage auténticas con historia y calidad garantizada.
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#F2D9D3] border-4 border-[#7C2632] rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0E3B2E]">3. Ve el resultado</h3>
              <p className="text-[#0E3B2E] opacity-70">
                Obtén una imagen realista de cómo te queda la prenda, manteniendo tu identidad y estilo personal.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowApp(true)}
              className="bg-gradient-to-r from-[#7C2632] to-[#0E3B2E] text-[#F7F4EC] px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Probar ahora gratis 🎯
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-[#0E3B2E]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <svg width="40" height="40" viewBox="0 0 200 200">
              <path 
                d="M40,60 q10,-15 30,-15 h100 q20,0 30,15 v80 q0,18 -15,28 l-30,20 q-15,10 -30,0 l-30,-20 q-15,-10 -15,-28 z" 
                fill="#7C2632"
              />
              <circle cx="60" cy="75" r="4" fill="#F7F4EC"/>
              <text x="100" y="110" textAnchor="middle" fontSize="24" fontWeight="700" fill="#F7F4EC">V</text>
              <text x="100" y="135" textAnchor="middle" fontSize="12" fontWeight="600" fill="#F7F4EC">LIZ</text>
            </svg>
            <h3 className="text-2xl font-bold text-[#F7F4EC]">VINTAGE DE LIZ</h3>
          </div>
          <p className="text-[#F7F4EC] opacity-80 mb-4">Curaduría vintage con historia</p>
          <p className="text-[#F7F4EC] opacity-60 text-sm">
            © 2024 Vintage de Liz. Tecnología de try-on virtual con IA avanzada.
          </p>
        </div>
      </footer>
    </div>
  );
}




