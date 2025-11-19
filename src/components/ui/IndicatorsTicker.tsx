'use client'

import { useState, useEffect } from 'react'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Indicator {
  name: string
  value: number
  change: number
  symbol: string
  color: string
  formatType: 'currency' | 'percentage' | 'number'
}

export function EconomicIndicatorsTicker() {
  const [indicators, setIndicators] = useState<Indicator[]>([
    {
      name: 'UF',
      value: 36680.59,
      change: 0.12,
      symbol: '$',
      color: 'text-blue-600',
      formatType: 'currency',
    },
    {
      name: 'UTM',
      value: 65967.00,
      change: 0,
      symbol: '$',
      color: 'text-purple-600',
      formatType: 'currency',
    },
    {
      name: 'USD',
      value: 953.67,
      change: -4.23,
      symbol: '$',
      color: 'text-green-600',
      formatType: 'currency',
    },
    {
      name: 'EUR',
      value: 1006.45,
      change: -2.15,
      symbol: '$',
      color: 'text-indigo-600',
      formatType: 'currency',
    },
    {
      name: 'BTC',
      value: 91450.23,
      change: 2.34,
      symbol: '$',
      color: 'text-orange-600',
      formatType: 'currency',
    },
  ])

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => { clearInterval(timer); }
  }, [])

  const formatValue = (indicator: Indicator) => {
    switch (indicator.formatType) {
      case 'currency':
        return `${indicator.symbol}${indicator.value.toLocaleString('es-CL', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      case 'percentage':
        return `${indicator.value.toFixed(2)}%`
      case 'number':
        return indicator.value.toLocaleString('es-CL')
      default:
        return indicator.value.toString()
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700 overflow-hidden">
      <div className="relative">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="animate-pulse bg-gradient-to-r from-blue-500/20 to-purple-500/20 h-full" />
        </div>

        <div className="relative px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Time and Status */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium text-slate-300">
                  Indicadores en tiempo real
                </span>
              </div>
              <div className="text-slate-400">
                {currentTime.toLocaleString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>

            {/* Center: Scrolling Indicators */}
            <div className="flex-1 max-w-4xl mx-8">
              <div className="flex items-center space-x-8 overflow-hidden">
                <div className="flex animate-marquee space-x-8">
                  {indicators.concat(indicators).map((indicator, index) => (
                    <div
                      key={`${indicator.name}-${index}`}
                      className="flex items-center space-x-2 whitespace-nowrap"
                    >
                      <span className={`font-semibold ${indicator.color}`}>
                        {indicator.name}
                      </span>
                      <span className="text-white font-mono">
                        {formatValue(indicator)}
                      </span>
                      <div className={`flex items-center ${getChangeColor(indicator.change)}`}>
                        {getChangeIcon(indicator.change)}
                        <span className="ml-1 text-xs font-medium">
                          {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Market Status */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-slate-300">Mercados Abiertos</span>
              </div>
              <div className="text-slate-400 text-xs">
                BCCh • Actualizado cada 5min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

// Compact version for mobile
export function CompactIndicatorsTicker() {
  const [indicators] = useState([
    { name: 'UF', value: 36680, change: 0.12 },
    { name: 'USD', value: 954, change: -4.23 },
  ])

  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="flex items-center space-x-2">
              <span className="font-semibold text-blue-400">{indicator.name}</span>
              <span className="text-white">${indicator.value.toLocaleString()}</span>
              <span className={`text-xs ${
                indicator.change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {indicator.change > 0 ? '+' : ''}{indicator.change}
              </span>
            </div>
          ))}
        </div>
        <div className="text-slate-400 text-xs">En vivo</div>
      </div>
    </div>
  )
}

// Export default para compatibilidad
export default EconomicIndicatorsTicker
