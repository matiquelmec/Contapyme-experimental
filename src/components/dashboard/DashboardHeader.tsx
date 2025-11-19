'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import {
  User,
  LogOut,
  Bell,
  Search,
  HelpCircle,
  Settings,
  ChevronDown,
  Building2,
  Home,
} from 'lucide-react'

import { Badge, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardHeader() {
  const { user, signOut } = useAuth() as any
  const [notifications, setNotifications] = useState(3)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => { clearInterval(timer); }
  }, [])

  const handleSignOut = async () => {
    await (signOut as any)()
  }

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Company */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>

              {/* Brand and Company */}
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ContaPyme
                </h1>
                <div className="text-xs text-gray-500 -mt-1">
                  Sistema Integrado de Gestión
                </div>
              </div>
            </div>

            {/* Company Selector */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Empresa Demo</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar widgets, reportes, clientes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Right: User Controls */}
          <div className="flex items-center space-x-4">
            {/* Current Time */}
            <div className="hidden md:block text-sm text-gray-600">
              <div className="font-medium">
                {currentTime.toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="text-xs text-gray-400">
                {currentTime.toLocaleDateString('es-CL', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <Badge
                    variant="error"
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0 min-w-[20px]"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Portal Link */}
            <Link href="/portal">
              <Button variant="ghost" size="sm" className="p-2" title="Ir al Portal Principal">
                <Home className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>

            {/* Help */}
            <Button variant="ghost" size="sm" className="p-2">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              {/* User Avatar and Info */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Gerente General
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-2 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-700">Sistema Operativo</span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">Última actualización: hace 5 min</span>
            </div>
            <div className="text-xs text-gray-600">
              <span>Módulos activos: 8/8</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
