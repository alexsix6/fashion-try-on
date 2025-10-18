'use client'

import { useState } from 'react'
import { Sparkles, Users, Link2, Heart, Upload } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
  count: number
  color: string
}

interface HorizontalTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  counts: {
    catalog: number
    tryOn: number
    combined: number
    favorites: number
    uploads: number
  }
}

export default function HorizontalTabs({ activeTab, onTabChange, counts }: HorizontalTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const tabs: Tab[] = [
    {
      id: 'catalog',
      label: 'Generated',
      icon: <Sparkles className="w-4 h-4" />,
      count: counts.catalog,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'tryOn',
      label: 'Avatar',
      icon: <Users className="w-4 h-4" />,
      count: counts.tryOn,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'combined',
      label: 'Combined',
      icon: <Link2 className="w-4 h-4" />,
      count: counts.combined,
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Heart className="w-4 h-4" />,
      count: counts.favorites,
      color: 'from-red-600 to-pink-600'
    },
    {
      id: 'uploads',
      label: 'Uploads',
      icon: <Upload className="w-4 h-4" />,
      count: counts.uploads,
      color: 'from-indigo-600 to-purple-600'
    }
  ]

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-2">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const isHovered = hoveredTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`
                relative flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 min-w-fit whitespace-nowrap
                ${isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                  : isHovered
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white'
                }
              `}
            >
              {/* Background glow effect for active tab */}
              {isActive && (
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.color} opacity-20 blur-sm`} />
              )}

              {/* Content */}
              <div className="relative flex items-center gap-2">
                {tab.icon}
                <span className="font-medium text-sm">{tab.label}</span>
                <div className={`
                  px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-700 text-gray-300'
                  }
                `}>
                  {tab.count}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r ${tab.color} rounded-full`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
