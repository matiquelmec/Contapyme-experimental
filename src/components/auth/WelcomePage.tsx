'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Building2, TrendingUp, Shield, Zap, Users, CheckCircle } from 'lucide-react'

export default function WelcomePage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'welcome'>('welcome')
  const { user, loading } = useAuth()
  const router = useRouter()

  // Direct navigation functions
  const navigateToDashboard = () => {
    router.push('/dashboard')
  }

  const navigateToPayroll = () => {
    router.push('/payroll')
  }

  const navigateToF29 = () => {
    router.push('/accounting/f29-analysis')
  }

  const navigateToFixedAssets = () => {
    router.push('/accounting/fixed-assets')
  }

  const navigateToIndicators = () => {
    router.push('/accounting/indicators')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user is logged in, redirect will be handled by middleware
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="/images/logo.png"
                alt="ContaPymePuq"
                className="h-32 w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center space-x-4">
              {activeTab !== 'login' && (
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('login')}
                >
                  Iniciar Sesión
                </Button>
              )}
              {activeTab !== 'register' && (
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('register')}
                >
                  Comenzar Gratis
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {activeTab === 'welcome' && (
          <div>
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Contabilidad <span className="text-blue-600">Inteligente</span>
                <br />
                para PyMEs Chilenas
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Sistema contable completo con análisis F29 automático, gestión de activos fijos, 
                remuneraciones y más. Todo integrado con normativa chilena actualizada.
              </p>
              <div className="flex gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  onClick={navigateToDashboard}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  🚀 Acceder al Sistema - Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveTab('login')}
                >
                  Iniciar Sesión
                </Button>
              </div>
              
              {/* Trial Benefits */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-800 font-medium">✨ Prueba gratuita de 7 días</p>
                <p className="text-green-600 text-sm">Sin tarjeta de crédito • Cancelación en cualquier momento</p>
              </div>
            </div>

            {/* Features Grid - Now Clickable */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card
                className="text-center hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 hover:border-blue-300"
                onClick={navigateToF29}
              >
                <CardHeader>
                  <div className="text-4xl mb-3">📊</div>
                  <CardTitle className="text-blue-600">Análisis F29 Automático</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Extracción automática y análisis comparativo de formularios F29 del SII con 95% de precisión.
                  </p>
                  <div className="flex items-center justify-center text-blue-600 text-sm mb-3">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    4 algoritmos en paralelo
                  </div>
                  <Button size="sm" className="w-full">
                    Probar F29 →
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="text-center hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 hover:border-purple-300"
                onClick={navigateToFixedAssets}
              >
                <CardHeader>
                  <div className="text-4xl mb-3">💼</div>
                  <CardTitle className="text-purple-600">Gestión Activos Fijos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Control completo con depreciación automática según normativa chilena y reportes ejecutivos.
                  </p>
                  <div className="flex items-center justify-center text-purple-600 text-sm mb-3">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Depreciación automática
                  </div>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    Ver Activos →
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="text-center hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 hover:border-green-300"
                onClick={navigateToPayroll}
              >
                <CardHeader>
                  <div className="text-4xl mb-3">💰</div>
                  <CardTitle className="text-green-600">Sistema Remuneraciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Liquidaciones automáticas con cálculos según ley laboral chilena actualizada.
                  </p>
                  <div className="flex items-center justify-center text-green-600 text-sm mb-3">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Normativa 2025
                  </div>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    Ver Payroll →
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Trial Plan */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-green-700">Prueba Gratuita</CardTitle>
                  <div className="text-3xl font-bold text-green-600">7 días</div>
                  <p className="text-green-600">Sin compromiso</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      1 empresa
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Análisis F29 ilimitados
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Gestión básica activos fijos
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Hasta 5 empleados
                    </li>
                  </ul>
                  <Button
                    fullWidth
                    className="bg-green-600 hover:bg-green-700"
                    onClick={navigateToDashboard}
                  >
                    Acceder Demo
                  </Button>
                </CardContent>
              </Card>

              {/* Basic Plan */}
              <Card className="border-blue-200 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Más Popular
                  </span>
                </div>
                <CardHeader className="text-center">
                  <CardTitle>Plan Básico</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">$29,990</div>
                  <p className="text-gray-500">por mes</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      1 empresa
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      Todas las funcionalidades
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      Hasta 25 empleados
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      Soporte prioritario
                    </li>
                  </ul>
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={navigateToDashboard}
                  >
                    Ver Demo
                  </Button>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="border-purple-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-purple-700">Profesional</CardTitle>
                  <div className="text-3xl font-bold text-purple-600">$59,990</div>
                  <p className="text-gray-500">por mes</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
                      Múltiples empresas
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
                      Empleados ilimitados
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
                      API access
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
                      Soporte 24/7
                    </li>
                  </ul>
                  <Button
                    fullWidth
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                    onClick={navigateToPayroll}
                  >
                    Ver Payroll
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-16">
              <div>
                <div className="text-3xl font-bold text-blue-600">95%</div>
                <div className="text-gray-600">Precisión F29</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">24/7</div>
                <div className="text-gray-600">Disponibilidad</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">100%</div>
                <div className="text-gray-600">Datos Seguros</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">500+</div>
                <div className="text-gray-600">PyMEs Confían</div>
              </div>
            </div>

            {/* CTA Final */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-2xl">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para transformar tu gestión contable?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Únete a las PyMEs que ya digitalizaron su contabilidad con ContaPyme
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={navigateToDashboard}
                >
                  Explorar Sistema Completo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={navigateToIndicators}
                >
                  Ver Indicadores
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'login' && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
              <p className="text-gray-600">Accede a tu cuenta de ContaPyme</p>
            </div>
            <LoginForm />
            <div className="text-center mt-6">
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setActiveTab('register')}
                >
                  Regístrate gratis
                </button>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
              <p className="text-gray-600">Comienza tu prueba gratuita de 7 días</p>
            </div>
            <RegisterForm />
            <div className="text-center mt-6">
              <p className="text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setActiveTab('login')}
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}