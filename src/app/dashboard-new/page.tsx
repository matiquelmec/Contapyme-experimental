'use client'

import { DashboardProvider } from '@/contexts/DashboardContext'
import { ModularDashboard } from '@/components/dashboard/ModularDashboard'

export default function NewDashboardPage() {
  return (
    <DashboardProvider>
      <ModularDashboard />
    </DashboardProvider>
  )
}