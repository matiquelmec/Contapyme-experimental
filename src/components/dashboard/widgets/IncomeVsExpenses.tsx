'use client'

import { useState, useEffect } from 'react'

import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface IncomeExpenseData {
  month: string
  income: number
  expenses: number
  net: number
  incomeChange: number
  expenseChange: number
}

export function IncomeVsExpenses() {
  const [data, setData] = useState<IncomeExpenseData[]>([])
  const [currentMonth, setCurrentMonth] = useState<IncomeExpenseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadIncomeExpenseData()
  }, [])

  const loadIncomeExpenseData = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/dashboard/income-expenses')
      // const data = await response.json()

      // Demo data with realistic Chilean PyME figures
      const mockData: IncomeExpenseData[] = [
        {
          month: 'Nov 2024',
          income: 18500000,
          expenses: 14200000,
          net: 4300000,
          incomeChange: 12.5,
          expenseChange: -8.3,
        },
      ]

      setData(mockData)
      setCurrentMonth(mockData[0])
    } catch (error) {
      console.error('Error loading income/expense data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const getNetMargin = (income: number, expenses: number) => ((income - expenses) / income * 100).toFixed(1)

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <DollarSign className="w-4 h-4 text-gray-400" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Ingresos vs Gastos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentMonth) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay datos disponibles</p>
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
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span>Ingresos vs Gastos</span>
          </div>
          <span className="text-sm text-gray-500">{currentMonth.month}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Net Result */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${currentMonth.net > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(currentMonth.net)}
          </div>
          <p className="text-sm text-gray-600">
            Resultado neto • {getNetMargin(currentMonth.income, currentMonth.expenses)}% margen
          </p>
        </div>

        {/* Income and Expenses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              {getChangeIcon(currentMonth.incomeChange)}
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(currentMonth.income)}
              </span>
            </div>
            <p className="text-xs text-gray-600">Ingresos</p>
            <p className={`text-xs ${getChangeColor(currentMonth.incomeChange)}`}>
              {currentMonth.incomeChange > 0 ? '+' : ''}{currentMonth.incomeChange}% vs mes anterior
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              {getChangeIcon(-Math.abs(currentMonth.expenseChange))}
              <span className="text-lg font-semibold text-red-600">
                {formatCurrency(currentMonth.expenses)}
              </span>
            </div>
            <p className="text-xs text-gray-600">Gastos</p>
            <p className={`text-xs ${getChangeColor(currentMonth.expenseChange)}`}>
              {currentMonth.expenseChange > 0 ? '+' : ''}{currentMonth.expenseChange}% vs mes anterior
            </p>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Eficiencia de gastos</span>
            <span className="font-medium">
              {(currentMonth.expenses / currentMonth.income * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
              style={{ width: `${100 - (currentMonth.expenses / currentMonth.income * 100)}%` }}
             />
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          {currentMonth.net > 0 ? (
            <div className="flex items-center justify-center space-x-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Mes rentable</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-1 text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">Pérdidas operacionales</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
