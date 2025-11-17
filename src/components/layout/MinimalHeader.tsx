'use client'

import React from 'react'

export const MinimalHeader = () => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="ContaPyme"
              className="h-12 w-auto"
            />
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="/portal" className="text-gray-700 hover:text-gray-900">Portal</a>
            <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
            <a href="/accounting" className="text-gray-700 hover:text-gray-900">Contabilidad</a>
            <a href="/payroll" className="text-gray-700 hover:text-gray-900">Remuneraciones</a>
          </nav>
        </div>
      </div>
    </div>
  )
}