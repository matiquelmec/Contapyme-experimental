'use client'

import { useState, useEffect } from 'react'

import {
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface BankAccount {
  id: string
  bank: string
  accountNumber: string
  accountType: 'checking' | 'savings' | 'credit'
  balance: number
  currency: string
  lastUpdate: string
  status: 'active' | 'frozen' | 'closed'
}

interface BankingPositionData {
  totalBalance: number
  accounts: BankAccount[]
  monthlyChange: number
  liquidityRatio: number
  alerts: Array<{
    type: 'warning' | 'info' | 'error'
    message: string
  }>
}

export function BankingPosition() {
  const [data, setData] = useState<BankingPositionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showBalances, setShowBalances] = useState(true)

  useEffect(() => {
    loadBankingData()
  }, [])

  const loadBankingData = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/dashboard/banking-position')
      // const data = await response.json()

      // Demo data with realistic Chilean banking information
      const mockData: BankingPositionData = {
        totalBalance: 45750000,
        monthlyChange: 12.8,
        liquidityRatio: 2.4,
        accounts: [
          {
            id: '1',
            bank: 'Banco de Chile',
            accountNumber: '****1234',
            accountType: 'checking',
            balance: 32400000,
            currency: 'CLP',
            lastUpdate: new Date().toISOString(),
            status: 'active',
          },
          {
            id: '2',
            bank: 'Banco Estado',
            accountNumber: '****5678',
            accountType: 'savings',
            balance: 8750000,
            currency: 'CLP',
            lastUpdate: new Date().toISOString(),
            status: 'active',
          },
          {
            id: '3',
            bank: 'Banco Santander',
            accountNumber: '****9012',
            accountType: 'credit',
            balance: 4600000,
            currency: 'CLP',
            lastUpdate: new Date().toISOString(),
            status: 'active',
          },
        ],
        alerts: [
          {
            type: 'info',
            message: 'Liquidez saludable para operaciones',
          },
          {
            type: 'warning',
            message: 'Concentración alta en cuenta corriente',
          },
        ],
      }

      setData(mockData)
    } catch (error) {
      console.error('Error loading banking data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (!showBalances) return '****'

    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getBankLogo = (bank: string) => 
    // In a real app, you'd have actual bank logos
     <Building2 className="w-6 h-6 text-blue-600" />

  const getAccountTypeLabel = (type: string) => {
    const labels = {
      checking: 'Cuenta Corriente',
      savings: 'Cuenta de Ahorro',
      credit: 'Línea de Crédito',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getAccountTypeColor = (type: string) => {
    const colors = {
      checking: 'text-blue-600',
      savings: 'text-green-600',
      credit: 'text-purple-600',
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <TrendingUp className="w-4 h-4 text-blue-500" />
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Posición Bancaria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay datos bancarios disponibles</p>
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
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Posición Bancaria</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setShowBalances(!showBalances); }}
              className="p-1 hover:bg-gray-100 rounded"
              title={showBalances ? 'Ocultar saldos' : 'Mostrar saldos'}
            >
              {showBalances ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={loadBankingData}
              className="p-1 hover:bg-gray-100 rounded"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Balance */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.totalBalance)}
          </div>
          <div className="flex items-center justify-center space-x-1 mt-1">
            {data.monthlyChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${data.monthlyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.monthlyChange > 0 ? '+' : ''}{data.monthlyChange}% este mes
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Liquidez: {data.liquidityRatio}x • {data.accounts.length} cuentas activas
          </p>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Cuentas Bancarias</h4>
          {data.accounts.map((account) => (
            <div key={account.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getBankLogo(account.bank)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {account.bank}
                  </span>
                  <span className="text-xs text-gray-500">
                    {account.accountNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${getAccountTypeColor(account.accountType)}`}>
                    {getAccountTypeLabel(account.accountType)}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Alertas</h4>
            {data.alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                {getAlertIcon(alert.type)}
                <span className="text-gray-700 text-xs leading-relaxed">
                  {alert.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 text-sm font-medium transition-colors">
            <CreditCard className="w-4 h-4" />
            <span>Conciliar</span>
          </button>
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 text-sm font-medium transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span>Proyectar</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
