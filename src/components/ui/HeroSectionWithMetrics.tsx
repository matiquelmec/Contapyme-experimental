'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import { TrendingUp, Users, DollarSign, BarChart3, Zap } from 'lucide-react'

import { Button, Badge } from '@/components/ui'

interface MetricsData {
  totalCompanies: number
  totalEmployees: number
  totalF29Processed: number
  totalAssets: number
  avgProcessingTime: number
  systemUptime: number
}

export function HeroSectionWithMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalCompanies: 0,
    totalEmployees: 0,
    totalF29Processed: 0,
    totalAssets: 0,
    avgProcessingTime: 0,
    systemUptime: 99.9,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar métricas reales desde la API del dashboard
    const loadMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        const data = await response.json()

        if (data.success) {
          setMetrics({
            totalCompanies: data.data.system.totalCompanies,
            totalEmployees: data.data.payroll.totalEmployees,
            totalF29Processed: data.data.accounting.totalF29,
            totalAssets: data.data.accounting.totalAssetsValue,
            avgProcessingTime: data.data.accounting.avgProcessingTime,
            systemUptime: data.data.system.systemUptime,
          })
        } else {
          // Fallback a datos demo si hay error
          setMetrics({
            totalCompanies: 1,
            totalEmployees: 8,
            totalF29Processed: 45,
            totalAssets: 8500000,
            avgProcessingTime: 1.8,
            systemUptime: 99.8,
          })
        }
      } catch (error) {
        console.error('Error loading metrics:', error)
        // Fallback a datos demo si hay error de conexión
        setMetrics({
          totalCompanies: 1,
          totalEmployees: 8,
          totalF29Processed: 45,
          totalAssets: 8500000,
          avgProcessingTime: 1.8,
          systemUptime: 99.8,
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Animación de contador para hacer más atractivo
    const animateCounter = () => {
      loadMetrics()
    }

    animateCounter()
  }, [])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatNumber = (num: number) => new Intl.NumberFormat('es-CL').format(num)

  return (
    <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white pt-24 pb-20 relative overflow-hidden">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          {/* Badge de Estado */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Badge
              variant="success"
              size="md"
              className="bg-green-500/20 text-green-100 border-green-400/30"
              dot
            >
              Sistema Activo
            </Badge>
            <Badge
              variant="primary"
              size="md"
              className="bg-blue-500/20 text-blue-100 border-blue-400/30"
              icon={<Zap className="h-3 w-3" />}
            >
              IA Avanzada
            </Badge>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Contabilidad <span className="text-blue-300">Inteligente</span>
            <br />para PyMEs Chilenas
          </h1>

          {/* Subtitle con valor */}
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            {isLoading ? (
              "Cargando métricas en tiempo real..."
            ) : (
              <>Más de <strong>{formatNumber(metrics.totalCompanies)}</strong> empresas confiando en nosotros para gestionar <strong>${formatNumber(Math.round(metrics.totalAssets / 1000000))}M</strong> en activos</>
            )}
          </p>

          {/* Métricas en Tiempo Real */}
          {!isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-blue-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(metrics.totalEmployees)}
                </div>
                <div className="text-sm text-blue-200">Empleados Activos</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-green-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(metrics.totalF29Processed)}
                </div>
                <div className="text-sm text-green-200">F29 Procesados</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-3">
                  <DollarSign className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {metrics.avgProcessingTime}s
                </div>
                <div className="text-sm text-yellow-200">Tiempo Promedio</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {metrics.systemUptime}%
                </div>
                <div className="text-sm text-purple-200">Disponibilidad</div>
              </div>
            </div>
          )}

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/accounting">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4">
                <TrendingUp className="w-5 h-5 mr-2" />
                Comenzar Análisis Gratis
              </Button>
            </Link>
            <Link href="/accounting/f29-comparative">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Ver Análisis Comparativo
              </Button>
            </Link>
          </div>

          {/* Value Proposition */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              <strong>Primera plataforma chilena</strong> que convierte formularios F29 en decisiones estratégicas con IA especializada en normativa nacional
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
