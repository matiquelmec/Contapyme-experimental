'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react'

interface Client {
  id: string
  name: string
  rut: string
  email?: string
  phone?: string
  address?: string
  totalRevenue: number
  monthlyRevenue: number
  revenueChange: number
  lastPurchase: string
  purchaseFrequency: number
  category: 'premium' | 'regular' | 'occasional'
  paymentBehavior: 'excellent' | 'good' | 'regular' | 'poor'
}

interface TopClientsData {
  clients: Client[]
  totalRevenue: number
  averageTicket: number
  clientGrowth: number
}

export function TopClients() {
  const [data, setData] = useState<TopClientsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    loadTopClientsData()
  }, [timeframe])

  const loadTopClientsData = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/dashboard/top-clients?timeframe=${timeframe}`)
      // const data = await response.json()

      // Demo data with realistic Chilean clients
      const mockData: TopClientsData = {
        totalRevenue: 42750000,
        averageTicket: 8550000,
        clientGrowth: 18.5,
        clients: [
          {
            id: '1',
            name: 'Constructora Los Álamos Ltda.',
            rut: '76.123.456-7',
            email: 'compras@losalamos.cl',
            phone: '+56 9 8765 4321',
            address: 'Las Condes, Santiago',
            totalRevenue: 15600000,
            monthlyRevenue: 5200000,
            revenueChange: 23.5,
            lastPurchase: '2024-11-10',
            purchaseFrequency: 2.3,
            category: 'premium',
            paymentBehavior: 'excellent'
          },
          {
            id: '2',
            name: 'Supermercado Central',
            rut: '96.789.012-3',
            email: 'gerencia@supercentral.cl',
            phone: '+56 2 2234 5678',
            address: 'Ñuñoa, Santiago',
            totalRevenue: 9800000,
            monthlyRevenue: 3266667,
            revenueChange: -8.2,
            lastPurchase: '2024-11-08',
            purchaseFrequency: 4.1,
            category: 'regular',
            paymentBehavior: 'good'
          },
          {
            id: '3',
            name: 'Restaurante Don Carlos',
            rut: '12.345.678-9',
            email: 'admin@doncarlos.cl',
            phone: '+56 9 9876 5432',
            address: 'Providencia, Santiago',
            totalRevenue: 7850000,
            monthlyRevenue: 2616667,
            revenueChange: 12.1,
            lastPurchase: '2024-11-12',
            purchaseFrequency: 3.8,
            category: 'regular',
            paymentBehavior: 'excellent'
          },
          {
            id: '4',
            name: 'Oficina Técnica SpA',
            rut: '77.654.321-0',
            email: 'contacto@oficina.cl',
            totalRevenue: 5200000,
            monthlyRevenue: 1733333,
            revenueChange: 45.6,
            lastPurchase: '2024-11-05',
            purchaseFrequency: 1.2,
            category: 'premium',
            paymentBehavior: 'good'
          },
          {
            id: '5',
            name: 'Farmacia Moderna',
            rut: '88.111.222-3',
            email: 'compras@moderna.cl',
            phone: '+56 2 2987 6543',
            address: 'La Florida, Santiago',
            totalRevenue: 4300000,
            monthlyRevenue: 1433333,
            revenueChange: -15.3,
            lastPurchase: '2024-10-28',
            purchaseFrequency: 2.9,
            category: 'regular',
            paymentBehavior: 'regular'
          }
        ]
      }

      setData(mockData)
    } catch (error) {
      console.error('Error loading top clients data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premium':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'regular':
        return <Users className="w-4 h-4 text-blue-500" />
      default:
        return <Users className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium':
        return 'text-yellow-600 bg-yellow-50'
      case 'regular':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPaymentBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'regular':
        return 'text-yellow-600'
      default:
        return 'text-red-600'
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Top 5 Clientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.clients.length) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay datos de clientes disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Top 5 Clientes</span>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="month">Este mes</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Año</option>
          </select>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-gray-600">Facturación total</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-lg font-bold text-green-600">
                +{data.clientGrowth}%
              </span>
            </div>
            <p className="text-xs text-gray-600">Crecimiento</p>
          </div>
        </div>

        {/* Top Clients List */}
        <div className="space-y-3">
          {data.clients.map((client, index) => (
            <div
              key={client.id}
              className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {/* Position Badge */}
              <div className="absolute -left-1 -top-1 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </div>

              <div className="pl-4 space-y-2">
                {/* Client Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(client.category)}
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {client.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500">{client.rut}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(client.monthlyRevenue)}
                    </div>
                    <div className="flex items-center space-x-1">
                      {client.revenueChange > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${client.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {client.revenueChange > 0 ? '+' : ''}{client.revenueChange}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Details */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    {client.address && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-20">{client.address}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(client.lastPurchase)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(client.category)}`}>
                      {client.category}
                    </span>
                    <span className={`text-xs ${getPaymentBehaviorColor(client.paymentBehavior)}`}>
                      •
                    </span>
                  </div>
                </div>

                {/* Revenue Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                    style={{
                      width: `${(client.monthlyRevenue / data.clients[0].monthlyRevenue) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-gray-200">
          <button className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 text-sm font-medium transition-colors">
            Ver todos los clientes
          </button>
        </div>
      </CardContent>
    </Card>
  )
}