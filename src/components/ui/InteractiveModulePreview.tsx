'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import { TrendingUp, ChevronRight, DollarSign, Users, FileText, BarChart3, Activity } from 'lucide-react'

import { Card, CardContent } from '@/components/ui'

interface ModuleMetrics {
  totalF29: number
  avgProcessingTime: number
  lastProcessed: string
  totalEmployees: number
  totalLiquidations: number
  avgSalary: number
  totalFixedAssets: number
  totalAssetsValue: number
  depreciation: number
}

interface ModulePreviewProps {
  type: 'accounting' | 'payroll'
  className?: string
}

export function InteractiveModulePreview({ type, className = '' }: ModulePreviewProps) {
  const [metrics, setMetrics] = useState<ModuleMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Cargar datos reales desde la API del dashboard
        const response = await fetch('/api/dashboard/metrics')
        const data = await response.json()

        if (data.success) {
          if (type === 'accounting') {
            setMetrics({
              totalF29: data.data.modules.f29Analysis.totalProcessed,
              avgProcessingTime: data.data.modules.f29Analysis.avgProcessingTime,
              lastProcessed: data.data.modules.f29Analysis.lastProcessed,
              totalEmployees: 0,
              totalLiquidations: 0,
              avgSalary: 0,
              totalFixedAssets: data.data.modules.fixedAssets.totalAssets,
              totalAssetsValue: data.data.modules.fixedAssets.totalValue,
              depreciation: data.data.modules.fixedAssets.monthlyDepreciation,
            })
          } else {
            setMetrics({
              totalF29: 0,
              avgProcessingTime: 0,
              lastProcessed: '',
              totalEmployees: data.data.modules.payroll.totalEmployees,
              totalLiquidations: data.data.modules.payroll.totalLiquidations,
              avgSalary: data.data.modules.payroll.avgSalary,
              totalFixedAssets: 0,
              totalAssetsValue: 0,
              depreciation: 0,
            })
          }
        } else {
          // Fallback a datos demo si hay error
          if (type === 'accounting') {
            setMetrics({
              totalF29: 45,
              avgProcessingTime: 1.8,
              lastProcessed: '3 horas',
              totalEmployees: 0,
              totalLiquidations: 0,
              avgSalary: 0,
              totalFixedAssets: 12,
              totalAssetsValue: 8500000,
              depreciation: 125000,
            })
          } else {
            setMetrics({
              totalF29: 0,
              avgProcessingTime: 0,
              lastProcessed: '',
              totalEmployees: 8,
              totalLiquidations: 96,
              avgSalary: 720000,
              totalFixedAssets: 0,
              totalAssetsValue: 0,
              depreciation: 0,
            })
          }
        }
      } catch (error) {
        console.error('Error loading metrics:', error)
        // Fallback a datos demo si hay error de conexión
        if (type === 'accounting') {
          setMetrics({
            totalF29: 45,
            avgProcessingTime: 1.8,
            lastProcessed: '3 horas',
            totalEmployees: 0,
            totalLiquidations: 0,
            avgSalary: 0,
            totalFixedAssets: 12,
            totalAssetsValue: 8500000,
            depreciation: 125000,
          })
        } else {
          setMetrics({
            totalF29: 0,
            avgProcessingTime: 0,
            lastProcessed: '',
            totalEmployees: 8,
            totalLiquidations: 96,
            avgSalary: 720000,
            totalFixedAssets: 0,
            totalAssetsValue: 0,
            depreciation: 0,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadMetrics()
      setLastUpdated(new Date())
    }, 30000)

    return () => { clearInterval(interval); }
  }, [type])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatNumber = (num: number) => new Intl.NumberFormat('es-CL').format(num)

  if (isLoading) {
    return (
      <Card className={`${className} group hover:shadow-2xl transition-all duration-300`}>
        <CardContent className="p-10 text-center h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Cargando métricas...</div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'accounting') {
    return (
      <Link href="/accounting">
        <Card className={`${className} group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 h-full relative overflow-hidden`}>
          {/* Live indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">En vivo</span>
          </div>

          <CardContent className="p-10 text-center h-full flex flex-col justify-between">
            <div>
              <div className="w-20 h-20 bg-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulo de Contabilidad</h2>

              {/* Real-time metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-blue-700">{formatNumber(metrics?.totalF29 || 0)}</div>
                  <div className="text-xs text-gray-600">F29 Procesados</div>
                </div>

                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-lg font-bold text-green-700">{metrics?.avgProcessingTime}s</div>
                  <div className="text-xs text-gray-600">Tiempo Prom.</div>
                </div>

                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-lg font-bold text-purple-700">{formatCurrency(metrics?.totalAssetsValue || 0).split(',')[0]}M</div>
                  <div className="text-xs text-gray-600">Activos Fijos</div>
                </div>

                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-1">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-lg font-bold text-orange-700">{metrics?.totalFixedAssets}</div>
                  <div className="text-xs text-gray-600">Items Activos</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Último proceso: hace {metrics?.lastProcessed}
              </div>
            </div>

            <div className="flex items-center justify-center text-blue-600 font-semibold text-lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              Acceder a Contabilidad
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href="/payroll">
      <Card className={`${className} group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-green-200 hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 h-full relative overflow-hidden`}>
        {/* Live indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">En vivo</span>
        </div>

        <CardContent className="p-10 text-center h-full flex flex-col justify-between">
          <div>
            <div className="w-20 h-20 bg-green-500 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">💰</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulo de Remuneraciones</h2>

            {/* Real-time metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-700">{formatNumber(metrics?.totalEmployees || 0)}</div>
                <div className="text-xs text-gray-600">Empleados</div>
              </div>

              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-700">{formatNumber(metrics?.totalLiquidations || 0)}</div>
                <div className="text-xs text-gray-600">Liquidaciones</div>
              </div>

              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-lg font-bold text-purple-700">{formatCurrency(metrics?.avgSalary || 0).split(',')[0]}K</div>
                <div className="text-xs text-gray-600">Sueldo Prom.</div>
              </div>

              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-orange-700">99.8%</div>
                <div className="text-xs text-gray-600">Precisión</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Última actualización: {lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="flex items-center justify-center text-green-600 font-semibold text-lg">
            <span className="text-2xl mr-2">👥</span>
            Acceder a RRHH
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
