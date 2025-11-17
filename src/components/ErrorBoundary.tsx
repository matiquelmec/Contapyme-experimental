'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, Copy, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import type { AppError, ErrorBoundaryState } from '@/types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  context?: string;
}

interface State extends ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  errorId: string;
  userAgent: string;
  timestamp: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Actualiza el estado para que la próxima renderización muestre la UI del error
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
      errorId,
      timestamp,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Actualizar estado con información completa del error
    this.setState({
      error,
      errorInfo,
    });

    // Ejecutar callback personalizado si se proporciona
    this.props.onError?.(error, errorInfo);

    // Crear objeto de error estructurado para logging
    const errorReport = this.createErrorReport(error, errorInfo);

    // Logging detallado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary - Error Capturado');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Report:', errorReport);
      console.groupEnd();
    }

    // Logging en producción (enviar a servicio de monitoreo)
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorReport);
    }

    // Notificar al usuario (en producción podría ser una notificación push)
    this.notifyUser(error);
  }

  createErrorReport = (error: Error, errorInfo: ErrorInfo) => {
    return {
      errorId: this.state.errorId,
      timestamp: this.state.timestamp,
      level: this.props.level || 'component',
      context: this.props.context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      userAgent: this.state.userAgent,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userId: null, // Se podría obtener del contexto de autenticación
      sessionId: this.getSessionId(),
      buildVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV,
    };
  };

  reportError = async (errorReport: any) => {
    try {
      // En producción, aquí se enviaría a servicios como:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - Servicio propio de logging

      console.error('Error Report:', errorReport);

      // Ejemplo de envío a API propia (comentado por ahora)
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  notifyUser = (error: Error) => {
    // Aquí se podría mostrar una notificación toast, etc.
    // Por ahora solo log
    console.warn('Error notificado al usuario:', error.message);
  };

  getSessionId = (): string => {
    // Generar o recuperar ID de sesión
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    }
    return 'unknown-session';
  };

  copyErrorInfo = async () => {
    const errorReport = this.createErrorReport(
      this.state.error!,
      this.state.errorInfo!
    );

    const errorText = `
ContaPyme - Reporte de Error
===========================

Error ID: ${errorReport.errorId}
Timestamp: ${errorReport.timestamp}
Level: ${errorReport.level}
Context: ${errorReport.context || 'N/A'}

Error Details:
- Name: ${errorReport.error.name}
- Message: ${errorReport.error.message}

Environment: ${errorReport.environment}
URL: ${errorReport.url}
User Agent: ${errorReport.userAgent}
Session ID: ${errorReport.sessionId}

Stack Trace:
${errorReport.error.stack}

Component Stack:
${errorReport.componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      alert('Información del error copiada al portapapeles');
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
      alert('No se pudo copiar la información del error');
    }
  };

  sendErrorReport = () => {
    const errorReport = this.createErrorReport(
      this.state.error!,
      this.state.errorInfo!
    );

    const subject = `ContaPyme Error Report - ${errorReport.errorId}`;
    const body = encodeURIComponent(`
Hola equipo de soporte,

Se ha producido un error en ContaPyme. Aquí están los detalles:

Error ID: ${errorReport.errorId}
Timestamp: ${errorReport.timestamp}
Error: ${errorReport.error.message}

Por favor, ayúdenme a resolver este problema.

Gracias,
Usuario de ContaPyme
    `);

    const mailtoLink = `mailto:soporte@contapyme.cl?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/accounting';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
                <div className="flex items-center text-white">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Error Inesperado</h1>
                    <p className="text-red-100 mt-1">
                      Algo ha salido mal en ContaPyme
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Qué ha ocurrido?
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Se ha producido un error técnico que ha interrumpido el funcionamiento normal
                    de la aplicación. Nuestro equipo ha sido notificado automáticamente.
                  </p>
                </div>

                {/* Error Message */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Mensaje de Error:
                  </h3>
                  <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded border">
                    {this.state.error?.message || 'Error desconocido'}
                  </p>
                </div>

                {/* Technical Details Toggle */}
                {(this.state.error?.stack || this.state.errorInfo) && (
                  <div className="mb-6">
                    <button
                      onClick={this.toggleDetails}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ChevronDown
                        className={`h-4 w-4 mr-2 transition-transform ${
                          this.state.showDetails ? 'rotate-180' : ''
                        }`}
                      />
                      {this.state.showDetails ? 'Ocultar' : 'Ver'} detalles técnicos
                    </button>

                    {this.state.showDetails && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                          Stack Trace:
                        </h4>
                        <pre className="text-xs text-gray-600 font-mono overflow-auto max-h-48 whitespace-pre-wrap break-all">
                          {this.state.error?.stack}
                        </pre>

                        {this.state.errorInfo && (
                          <>
                            <h4 className="text-xs font-medium text-gray-700 mb-2 mt-4 uppercase tracking-wide">
                              Component Stack:
                            </h4>
                            <pre className="text-xs text-gray-600 font-mono overflow-auto max-h-32 whitespace-pre-wrap">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {/* Primary Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={this.handleReload}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Recargar Página
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={this.handleGoHome}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      Ir al Dashboard
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={this.copyErrorInfo}
                      className="flex-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Información del Error
                    </Button>

                    <Button
                      variant="ghost"
                      size="md"
                      onClick={this.sendErrorReport}
                      className="flex-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Reporte por Email
                    </Button>
                  </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    💡 ¿Necesitas ayuda?
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Si este error persiste, por favor contacta al soporte técnico con
                    los detalles técnicos mostrados arriba. Te ayudaremos a resolverlo rápidamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                ContaPyme - Error ID: {Date.now().toString(36)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {process.env.NODE_ENV === 'development'
                  ? 'Entorno de Desarrollo'
                  : 'Entorno de Producción'
                }
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;