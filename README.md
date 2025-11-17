# 💼 ContaPyme - Sistema Contable Integral

Sistema contable completo para PyMEs construido con **Next.js 14**, **TypeScript**, **Supabase** y **Tailwind CSS**.

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js 18+**
- **npm** o **yarn**
- **Supabase** (proyecto configurado)

### Instalación

```bash
# Clonar e instalar dependencias
git clone <repository-url>
cd contapyme-sistema-contable
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase
```

### Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="tu-url-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-supabase"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# APIs IA (opcional)
OPENAI_API_KEY="sk-tu-openai-key"
ANTHROPIC_API_KEY="sk-ant-tu-anthropic-key"
```

### Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor desarrollo (puerto 3000)

# Build y producción
npm run build            # Compilar proyecto
npm run start            # Servidor producción

# Calidad de código
npm run type-check       # Verificar tipos TypeScript
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Auto-arreglar problemas ESLint

# Tests
npm test                # Ejecutar tests
npm run test:coverage   # Tests con cobertura
```

## 📋 Funcionalidades Principales

### 📊 **Contabilidad**
- ✅ Libro Diario y Mayor
- ✅ Balance de 8 Columnas
- ✅ Plan de Cuentas Chileno
- ✅ Análisis F29 y RCV
- ✅ Libro de Compras/Ventas
- ✅ Dashboard Ejecutivo

### 👥 **Remuneraciones**
- ✅ Gestión de Empleados
- ✅ Cálculo de Liquidaciones
- ✅ Libro de Remuneraciones
- ✅ Exportación PREVIRED
- ✅ Contratos y Finiquitos

### 🏢 **Activos Fijos**
- ✅ Registro de Activos
- ✅ Depreciación Automática
- ✅ Reportes de Activos

### 📈 **Dashboard**
- ✅ Métricas en Tiempo Real
- ✅ Indicadores Económicos
- ✅ Proyecciones de Flujo
- ✅ Alertas Tributarias

## 🛠️ Stack Tecnológico

```
Frontend:     Next.js 14 + TypeScript + React 18
Estilos:      Tailwind CSS + Tailwind Animate
Base de Datos: Supabase (PostgreSQL)
Validación:   Zod + React Hook Form
Gráficos:     Recharts
PDFs:         jsPDF + PDF-lib
```

## 📁 Estructura del Proyecto

```
src/
├── app/                 # App Router (Next.js 14)
│   ├── accounting/      # Módulo contabilidad
│   ├── payroll/        # Módulo remuneraciones
│   ├── dashboard/      # Dashboard ejecutivo
│   └── api/            # API Routes
├── components/         # Componentes React
├── lib/               # Utilidades y servicios
├── modules/           # Módulos específicos
├── types/            # Definiciones TypeScript
└── hooks/            # React Hooks personalizados
```

## ⚙️ Configuración de Desarrollo

### Base de Datos
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar migraciones SQL (archivos `.sql` en raíz)
3. Configurar variables de entorno

### Desarrollo Local
```bash
# Limpiar cache
npm run clean

# Desarrollo con Turbo (más rápido)
npm run dev:turbo

# Desarrollo con inspector
npm run dev:debug
```

## 🔒 Seguridad

- ✅ Headers de seguridad configurados
- ✅ Validación estricta con Zod
- ✅ Autenticación vía Supabase
- ✅ Rate limiting en APIs
- ✅ Sanitización de inputs

## 📊 Calidad de Código

```bash
# Verificación completa
npm run quality

# Arreglar automáticamente
npm run quality:fix
```

### Métricas Objetivo
- **Cobertura Tests**: >80%
- **Performance**: LCP <2.5s
- **TypeScript**: 0 errores
- **ESLint**: 0 errores

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Deploy automático
vercel

# Con configuraciones específicas
vercel --prod
```

### Manual
```bash
npm run build
npm run start
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📝 Licencia

MIT License - ver archivo [LICENSE](LICENSE)

---

## 🆘 Troubleshooting

### Error: Cannot find module
```bash
npm run clean:all  # Limpia node_modules y reinstala
```

### Error: Database connection
- Verificar variables de entorno Supabase
- Comprobar conexión a internet
- Revisar logs en Supabase Dashboard

### Error: Build falló
```bash
npm run type-check  # Verificar errores TypeScript
npm run lint       # Verificar errores ESLint
```

## 📞 Soporte

- **Email**: soporte@contapymepuq.cl
- **Documentación**: [Docs](docs/)
- **Issues**: [GitHub Issues](issues)

---

**Desarrollado con ❤️ por el equipo ContaPymePuq**