'use client'

import { useState } from 'react'

import Link from 'next/link'

import {
  Settings,
  Layout,
  RefreshCw,
  Eye,
  Plus,
  Grid3X3,
  BarChart3,
  Users,
  BookOpen,
  Calculator,
  Zap,
  Shield,
  Sparkles,
} from 'lucide-react'

import { Button, Badge } from '@/components/ui'
import { useDashboard } from '@/contexts/DashboardContext'
import type { DashboardView } from '@/types/dashboard'

import { EconomicIndicatorsTicker } from './EconomicIndicatorsTicker'
import { WidgetRenderer } from './WidgetRenderer'

export function ModularDashboard() {
  const {
    state,
    switchView,
    toggleCustomization,
    refreshAllWidgets,
  } = useDashboard()

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get current active layout
  const activeLayout = state.layouts.find(layout => layout.id === state.activeLayout)

  // Handle refresh all widgets
  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    refreshAllWidgets()

    // Wait for all widgets to refresh (simulate)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 2000)
  }

  // View configuration
  const viewConfig = {
    vision_360: {
      title: 'Visión 360°',
      description: 'Dashboard ejecutivo para toma de decisiones estratégicas',
      icon: Grid3X3,
      color: 'blue',
      role: 'Gerente General',
    },
    compliance_cockpit: {
      title: 'Cockpit de Cumplimiento',
      description: 'Centro de control contable y tributario',
      icon: BarChart3,
      color: 'purple',
      role: 'Contador',
    },
    human_capital: {
      title: 'Gestión de Capital Humano',
      description: 'Control integral de recursos humanos',
      icon: Users,
      color: 'green',
      role: 'RRHH',
    },
  }

  const currentViewConfig = viewConfig[state.currentView]
  const ViewIcon = currentViewConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Dashboard Ejecutivo</h1>
                  <p className="text-xl text-blue-100">
                    Centro de Control Integral para PyMEs Chilenas
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    <div>
                      <p className="font-semibold">Widgets Inteligentes</p>
                      <p className="text-sm text-blue-100">Datos en tiempo real</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-green-300" />
                    <div>
                      <p className="font-semibold">100% Chileno</p>
                      <p className="text-sm text-blue-100">Normativa nacional</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6 text-purple-300" />
                    <div>
                      <p className="font-semibold">Sistema Integrado</p>
                      <p className="text-sm text-blue-100">Vistas especializadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/portal"
              className="hidden lg:flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all backdrop-blur-sm border border-white/20 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Portal Principal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Economic Indicators Ticker */}
      <EconomicIndicatorsTicker />

      {/* View Selector and Controls */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* View Selector */}
            <div className="flex items-center space-x-1">
              {Object.entries(viewConfig).map(([viewKey, config]) => {
                const isActive = state.currentView === viewKey
                const Icon = config.icon

                return (
                  <button
                    key={viewKey}
                    onClick={() => { switchView(viewKey as DashboardView); }}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{config.title}</span>
                    {isActive && <Sparkles className="w-4 h-4 text-blue-500" />}
                  </button>
                )
              })}
            </div>

            {/* Dashboard Controls */}
            <div className="flex items-center space-x-2">
              {/* Current view info */}
              <div className="text-sm text-gray-600 mr-4">
                <span className="font-medium">{currentViewConfig.role}</span>
              </div>

              {/* Refresh All Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </Button>

              {/* Customize Button */}
              <Button
                variant={state.isCustomizing ? "danger" : "ghost"}
                size="sm"
                onClick={toggleCustomization}
                className="flex items-center space-x-1"
              >
                <Settings className="w-4 h-4" />
                <span>{state.isCustomizing ? 'Finalizar' : 'Personalizar'}</span>
              </Button>
            </div>
          </div>

          {/* View Description */}
          <div className="mt-2 flex items-center space-x-3">
            <ViewIcon className={`w-5 h-5 text-${currentViewConfig.color}-600`} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {currentViewConfig.title}
              </h1>
              <p className="text-sm text-gray-600">
                {currentViewConfig.description}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {activeLayout?.widgets.filter(w => w.visible).length || 0} widgets activos
            </Badge>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-6">
        {activeLayout ? (
          <div className="space-y-6">
            {/* Customization Mode Notice */}
            {state.isCustomizing && (
              <div className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Layout className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Modo de Personalización</h3>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Puedes arrastrar, redimensionar y configurar los widgets. Los cambios se guardan automáticamente.
                </p>
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="ghost" className="text-blue-700 hover:bg-blue-100">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Widget
                  </Button>
                  <Button size="sm" variant="ghost" className="text-blue-700 hover:bg-blue-100">
                    <Eye className="w-4 h-4 mr-1" />
                    Vista Previa
                  </Button>
                </div>
              </div>
            )}

            {/* Widgets Grid */}
            <div className="grid grid-cols-12 gap-6 auto-rows-min">
              {activeLayout.widgets
                .filter(widget => widget.visible)
                .sort((a, b) => {
                  // Sort by position: first by Y, then by X
                  if (a.position.y !== b.position.y) {
                    return a.position.y - b.position.y
                  }
                  return a.position.x - b.position.x
                })
                .map(widget => (
                  <div
                    key={widget.id}
                    className={`col-span-12 ${
                      widget.size === 'small' ? 'md:col-span-3' :
                      widget.size === 'medium' ? 'md:col-span-4 lg:col-span-4' :
                      widget.size === 'large' ? 'md:col-span-6 lg:col-span-8' :
                      'md:col-span-12'
                    }`}
                    style={{
                      // Use CSS Grid for complex layouts in customization mode
                      ...(state.isCustomizing && {
                        gridColumn: `span ${widget.position.w}`,
                        gridRow: `span ${widget.position.h}`,
                      }),
                    }}
                  >
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 h-full">
                      <WidgetRenderer
                        widget={widget}
                        isCustomizing={state.isCustomizing}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {(!activeLayout.widgets || activeLayout.widgets.filter(w => w.visible).length === 0) && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Dashboard Vacío
                </h3>
                <p className="text-gray-600 mb-4">
                  No hay widgets configurados para esta vista.
                </p>
                <Button onClick={toggleCustomization}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Widgets
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
            </div>
          </div>
        )}

        {/* System Integration Notice */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border border-indigo-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">
                Dashboard Ejecutivo Completamente Integrado
              </h3>
              <p className="text-indigo-700 mb-4">
                Dashboard inteligente que centraliza datos de contabilidad, remuneraciones e indicadores económicos.
                Los widgets se actualizan en tiempo real con datos reales del sistema. Vistas especializadas para cada rol empresarial.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-indigo-800">Widgets en Tiempo Real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-indigo-800">Datos Integrados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-sm font-medium text-indigo-800">Vistas Especializadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating customization panel (when in customization mode) */}
      {state.isCustomizing && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-64">
            <h4 className="font-medium text-gray-900 mb-3">Panel de Personalización</h4>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Widgets disponibles: {Object.keys(viewConfig).length}
              </div>
              <div className="text-sm text-gray-600">
                Widgets activos: {activeLayout?.widgets.filter(w => w.visible).length || 0}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleCustomization}
                className="w-full"
              >
                Finalizar Personalización
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
