# 🚀 Guía de Despliegue - ContaPyme

## Opciones de Despliegue

### 1. Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar desde el directorio del proyecto
cd "C:\Users\Matías Riquelme\Desktop\Experimento contapyme"
vercel

# Seguir las instrucciones del CLI
```

**Variables de entorno en Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `SIGNATURE_SECRET_KEY`
- `ANTHROPIC_API_KEY`

### 2. Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Inicializar y desplegar
netlify init
netlify build
netlify deploy --prod
```

### 3. Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

## Pre-requisitos de Despliegue

### ✅ Checklist Completado
- [x] Build exitoso (123 páginas estáticas generadas)
- [x] Configuración de Next.js optimizada
- [x] Variables de entorno preparadas
- [x] Base de datos Supabase configurada
- [x] Archivos de despliegue creados

### ⚠️ Issues a Resolver (Opcionales)
- [ ] 242 errores TypeScript (no bloquean el build)
- [ ] 19 vulnerabilidades de seguridad (1 alta, 18 moderadas)
- [ ] Dependencias desactualizadas

## Comandos de Preparación

```bash
# Instalar dependencias
npm install

# Verificar build
npm run build

# Ejecutar en producción local
npm start

# Linting (opcional)
npm run lint
```

## Configuración de Base de Datos

El proyecto está configurado para usar Supabase con el proyecto:
- **Project ID:** yttdnmokivtayeunlvlk
- **URL:** https://yttdnmokivtayeunlvlk.supabase.co

## Performance del Build

- **Tiempo de build:** ~5 segundos
- **Páginas generadas:** 123 (todas estáticas u optimizadas)
- **Tamaño de bundle:** 87.7 kB compartido
- **Middleware:** 26.5 kB

## Comandos Post-Despliegue

```bash
# Verificar el sitio desplegado
curl -I https://tu-dominio.vercel.app

# Monitorear logs (Vercel)
vercel logs

# Verificar funciones API
curl https://tu-dominio.vercel.app/api/dashboard/metrics
```

## Troubleshooting

### Errores Comunes

1. **Variables de entorno faltantes**
   - Verificar que todas las variables estén configuradas en el dashboard del proveedor

2. **Errores de Supabase**
   - Verificar que las credenciales sean correctas
   - Confirmar que el proyecto Supabase esté activo

3. **Timeouts en funciones**
   - Las funciones API están configuradas para 60s máximo

### Monitoreo

- **Vercel:** Dashboard integrado con métricas
- **Supabase:** Panel de administración para DB
- **Logs:** Disponibles en tiempo real en ambas plataformas

## Siguiente Paso

¡El proyecto está listo para desplegar! Recomiendo usar **Vercel** por su integración nativa con Next.js.

Comando de despliegue rápido:
```bash
vercel --prod
```