import { Suspense } from 'react'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Cargando generador de liquidaciones...</p>
    </div>
  </div>
)

export default function GenerateLiquidationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  )
}
