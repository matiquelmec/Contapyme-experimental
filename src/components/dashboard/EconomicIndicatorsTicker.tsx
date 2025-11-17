'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'

interface IndicatorData {
  code: string
  name: string
  value: number
  unit: string
  change: number
  changePercent: number
  lastUpdate: string
  trend: 'up' | 'down' | 'stable'
}

export function EconomicIndicatorsTicker() {
  const [indicators, setIndicators] = useState<IndicatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    loadIndicators()

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadIndicators, 300000)
    return () => clearInterval(interval)
  }, [])

  const loadIndicators = async () => {
    try {
      const response = await fetch('/api/indicators')

      if (response.ok) {
        const data = await response.json()

        // Transform API data to ticker format
        const tickerData: IndicatorData[] = [
          {
            code: 'UF',
            name: 'Unidad de Fomento',
            value: data.data.monetary?.find((i: any) => i.code === 'uf')?.value || 37842.15,
            unit: '$',
            change: 12.45,
            changePercent: 0.033,
            lastUpdate: new Date().toISOString(),
            trend: 'up'
          },
          {
            code: 'UTM',
            name: 'Unidad Tributaria Mensual',
            value: data.data.monetary?.find((i: any) => i.code === 'utm')?.value || 67328,
            unit: '$',
            change: 0,
            changePercent: 0,
            lastUpdate: new Date().toISOString(),
            trend: 'stable'
          },
          {
            code: 'USD',
            name: 'Dólar Estadounidense',
            value: data.data.currencies?.find((i: any) => i.code === 'usd')?.value || 953.67,
            unit: '$',
            change: -4.23,
            changePercent: -0.44,
            lastUpdate: new Date().toISOString(),
            trend: 'down'
          },
          {
            code: 'EUR',
            name: 'Euro',
            value: data.data.currencies?.find((i: any) => i.code === 'eur')?.value || 1006.45,
            unit: '$',
            change: -2.15,
            changePercent: -0.21,
            lastUpdate: new Date().toISOString(),
            trend: 'down'
          },
          {
            code: 'IPC',
            name: 'Índice de Precios al Consumidor',
            value: 0.2,
            unit: '%',
            change: 0.1,
            changePercent: 0,
            lastUpdate: new Date().toISOString(),
            trend: 'up'
          },
          {
            code: 'TPM',
            name: 'Tasa de Política Monetaria',
            value: 5.75,
            unit: '%',
            change: 0,
            changePercent: 0,
            lastUpdate: new Date().toISOString(),
            trend: 'stable'
          }
        ]

        setIndicators(tickerData)
      } else {
        // Fallback data
        setIndicators([
          {
            code: 'UF',
            name: 'Unidad de Fomento',
            value: 37842.15,
            unit: '$',
            change: 12.45,
            changePercent: 0.033,
            lastUpdate: new Date().toISOString(),
            trend: 'up'
          },
          {
            code: 'UTM',
            name: 'Unidad Tributaria Mensual',
            value: 67328,
            unit: '$',
            change: 0,
            changePercent: 0,
            lastUpdate: new Date().toISOString(),
            trend: 'stable'
          },
          {
            code: 'USD',
            name: 'Dólar Estadounidense',
            value: 953.67,
            unit: '$',
            change: -4.23,
            changePercent: -0.44,
            lastUpdate: new Date().toISOString(),
            trend: 'down'
          },
          {
            code: 'EUR',
            name: 'Euro',
            value: 1006.45,
            unit: '$',
            change: -2.15,
            changePercent: -0.21,
            lastUpdate: new Date().toISOString(),
            trend: 'down'
          },
          {
            code: 'IPC',
            name: 'Índice de Precios al Consumidor',
            value: 0.2,
            unit: '%',
            change: 0.1,
            changePercent: 0,
            lastUpdate: new Date().toISOString(),
            trend: 'up'
          },
          {
            code: 'TPM',
            name: 'Tasa de Política Monetaria',
            value: 5.75,
            unit: '%',
            change: 0,
            changePercent: 0,
            lastUpdate: new Date().toISOString(),
            trend: 'stable'
          }
        ])
      }
    } catch (error) {
      console.error('Error loading indicators:', error)
      // Use fallback data on error
      setIndicators([
        {
          code: 'UF',
          name: 'Unidad de Fomento',
          value: 37842.15,
          unit: '$',
          change: 12.45,
          changePercent: 0.033,
          lastUpdate: new Date().toISOString(),
          trend: 'up'
        },
        {
          code: 'UTM',
          name: 'Unidad Tributaria Mensual',
          value: 67328,
          unit: '$',
          change: 0,
          changePercent: 0,
          lastUpdate: new Date().toISOString(),
          trend: 'stable'
        },
        {
          code: 'USD',
          name: 'Dólar Estadounidense',
          value: 953.67,
          unit: '$',
          change: -4.23,
          changePercent: -0.44,
          lastUpdate: new Date().toISOString(),
          trend: 'down'
        }
      ])
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }

  const formatValue = (indicator: IndicatorData) => {
    if (indicator.unit === '$') {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: indicator.code === 'UF' || indicator.code === 'UTM' ? 2 : 0,
        maximumFractionDigits: indicator.code === 'UF' || indicator.code === 'UTM' ? 2 : 2
      }).format(indicator.value)
    } else {
      return `${indicator.value}${indicator.unit}`
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />
      default:
        return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-500 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-2">
            <div className="flex space-x-8 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-8 h-4 bg-blue-400/30 rounded"></div>
                  <div className="w-16 h-4 bg-blue-400/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-500 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Scrolling indicators */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center space-x-8 animate-scroll">
              {indicators.map((indicator, index) => (
                <div key={`${indicator.code}-${index}`} className="flex items-center space-x-2 whitespace-nowrap">
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                    {indicator.code}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {formatValue(indicator)}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(indicator.trend)}
                    {indicator.change !== 0 && (
                      <span className={`text-xs font-medium ${getTrendColor(indicator.trend)}`}>
                        {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Duplicate indicators for seamless scrolling */}
              {indicators.map((indicator, index) => (
                <div key={`${indicator.code}-duplicate-${index}`} className="flex items-center space-x-2 whitespace-nowrap">
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                    {indicator.code}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {formatValue(indicator)}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(indicator.trend)}
                    {indicator.change !== 0 && (
                      <span className={`text-xs font-medium ${getTrendColor(indicator.trend)}`}>
                        {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh button and status */}
          <div className="flex items-center space-x-3 ml-4">
            <div className="text-xs text-blue-100">
              {lastRefresh.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <button
              onClick={loadIndicators}
              disabled={isLoading}
              className="p-1 rounded-full hover:bg-blue-500/30 transition-colors disabled:opacity-50"
              title="Actualizar indicadores"
            >
              <RefreshCw className={`w-4 h-4 text-blue-100 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom scrolling animation */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}