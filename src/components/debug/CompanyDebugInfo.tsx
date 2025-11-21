'use client';

import { useCompany } from '@/contexts/CompanyContext';
import { useEffect, useState } from 'react';

export default function CompanyDebugInfo() {
  const { company } = useCompany();
  const [logs, setLogs] = useState<string[]>([]);

  // Capturar eventos de cambio de empresa
  useEffect(() => {
    const handleCompanyChange = (event: CustomEvent) => {
      const timestamp = new Date().toLocaleTimeString();
      const newLog = `${timestamp} - Company changed to: ${event.detail.newCompanyId} (${event.detail.companyData?.razon_social})`;
      setLogs(prev => [...prev.slice(-4), newLog]); // Mantener últimos 5 logs
    };

    window.addEventListener('companyChanged', handleCompanyChange as EventListener);
    return () => window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
  }, []);

  // Log when company.id changes
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `${timestamp} - Context company ID: ${company.id} (${company.razon_social})`;
    setLogs(prev => [...prev.slice(-4), newLog]);
  }, [company.id, company.razon_social]);

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs max-w-md z-50">
      <div className="font-bold mb-2">🐛 Company Debug Info</div>
      <div className="space-y-1">
        <div><strong>Current ID:</strong> {company.id}</div>
        <div><strong>Name:</strong> {company.razon_social}</div>
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="font-bold mb-1">Event Log:</div>
          {logs.map((log, i) => (
            <div key={i} className="text-gray-300">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}