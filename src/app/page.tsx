'use client'

import Link from 'next/link'

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="p-8">
        {/* Hero Section */}
        <section className="text-center mb-12 pt-8">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">ContaPyme</h1>
          <p className="text-xl text-gray-600">Contabilidad Inteligente para PyMEs Chilenas</p>
        </section>

      {/* Empresa Demo Section */}
      <section className="max-w-4xl mx-auto mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-200 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🚀 Prueba ContaPyme con Empresa Demo</h2>
          <p className="text-lg text-gray-600 mb-8">
            Explora todas las funcionalidades con datos de ejemplo ya configurados
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/accounting" className="block">
              <div className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 transition-all hover:scale-105 border border-blue-200">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Contabilidad</h3>
                <p className="text-blue-700">Análisis F29, Activos Fijos, Plan de Cuentas</p>
              </div>
            </Link>

            <Link href="/payroll" className="block">
              <div className="bg-green-50 hover:bg-green-100 rounded-xl p-6 transition-all hover:scale-105 border border-green-200">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Remuneraciones</h3>
                <p className="text-green-700">Empleados, Liquidaciones, Libro de Remuneraciones</p>
              </div>
            </Link>

            <Link href="/dashboard-new" className="block">
              <div className="bg-purple-50 hover:bg-purple-100 rounded-xl p-6 transition-all hover:scale-105 border border-purple-200">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Dashboard</h3>
                <p className="text-purple-700">Métricas en tiempo real, Análisis avanzado</p>
              </div>
            </Link>
          </div>

          <div className="mt-8">
            <Link href="/portal" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors">
              🏢 Acceder al Portal Multi-Empresa
            </Link>
          </div>
        </div>
      </section>

      {/* Acciones Rápidas */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Acciones Rápidas</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/accounting/f29-analysis" className="block">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-blue-500">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analizar F29</h3>
              <p className="text-gray-600">Análisis automático con IA especializada</p>
            </div>
          </Link>

          <Link href="/accounting/fixed-assets" className="block">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-purple-500">
              <div className="text-3xl mb-4">🏭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activos Fijos</h3>
              <p className="text-gray-600">Depreciación automática y reportes</p>
            </div>
          </Link>

          <Link href="/payroll/employees" className="block">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-green-500">
              <div className="text-3xl mb-4">👨‍💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Empleados</h3>
              <p className="text-gray-600">Gestión integral de recursos humanos</p>
            </div>
          </Link>
        </div>
      </section>

        {/* Footer Simple */}
        <footer className="text-center mt-16 text-gray-500">
          <p>© 2024 ContaPyme - Sistema de Contabilidad Inteligente para PyMEs</p>
        </footer>
      </div>
    </div>
  )
}
