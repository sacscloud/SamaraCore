# 🔒 Tareas de Seguridad Pendientes

Este archivo documenta las mejoras de seguridad que deben implementarse en SamaraCore.

## 1. Autenticación Completa con Firebase Admin

### Instalación
```bash
npm install firebase-admin
```

### Implementación
1. Obtener las credenciales de servicio de Firebase Console
2. Actualizar `lib/auth-middleware.ts` con la verificación real de tokens
3. Agregar las variables de entorno de Firebase Admin al `.env.local`

## 2. Protección de API Routes

### Cambios necesarios:
- [ ] Implementar verificación de tokens en todas las rutas de API
- [ ] Agregar `userId` a todos los documentos de agentes
- [ ] Filtrar consultas por `userId` del usuario autenticado
- [ ] Validar que los usuarios solo puedan modificar sus propios recursos

## 3. Actualizar el Middleware de Next.js

Archivo: `middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  
  // Verificar token con Firebase Admin
  if (!token || !await verifyToken(token)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return NextResponse.next()
}
```

## 4. Variables de Entorno de Producción

Asegurarse de configurar en producción:
- Todas las variables de Firebase
- MongoDB URI con credenciales seguras
- Variables de Firebase Admin para verificación del servidor

## 5. Logging y Monitoreo

Reemplazar todos los `console.log` y `console.error` con un sistema de logging apropiado:
- Winston
- Pino
- O integración con servicios como Sentry

## 6. Rate Limiting

Implementar límites de tasa en las API routes para prevenir abuso:
```bash
npm install express-rate-limit
```

## 7. Validación de Entrada

- [ ] Validar todos los inputs del usuario con Zod
- [ ] Sanitizar datos antes de guardar en la base de datos
- [ ] Implementar longitudes máximas para campos de texto

## 8. CORS y Headers de Seguridad

Configurar headers de seguridad apropiados en `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  // ... más headers
]
```

## 9. Pruebas de Seguridad

- [ ] Escribir tests para verificar autenticación
- [ ] Probar intentos de acceso no autorizado
- [ ] Verificar validación de datos

## 10. Documentación de API

Documentar claramente:
- Endpoints disponibles
- Headers requeridos
- Formato de autenticación
- Límites de tasa
- Ejemplos de uso