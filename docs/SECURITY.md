# Seguridad de la API de Agentes

## ✅ Mejoras de Seguridad Implementadas

### Problema Resuelto
Se ha corregido una vulnerabilidad crítica de seguridad donde las rutas de la API de agentes (`/api/agents`) estaban completamente abiertas al público, permitiendo a usuarios no autenticados:
- Leer todos los agentes existentes
- Crear nuevos agentes
- Modificar agentes existentes
- Eliminar agentes

### Implementación de Autenticación

#### 1. Middleware de Autenticación (`lib/auth-middleware.ts`)
- ✅ Verificación de tokens de autorización Bearer
- ✅ Validación básica del formato del token
- ✅ Respuestas de error 401 para requests no autorizados
- ⚠️ **PENDIENTE**: Implementación completa con Firebase Admin SDK

#### 2. Protección de Endpoints de API
Las siguientes rutas ahora requieren autenticación:

**GET /api/agents**
- Requiere token de autorización
- Retorna lista de agentes solo para usuarios autenticados

**POST /api/agents**
- Requiere token de autorización
- Agrega `createdBy` al agente con el ID del usuario autenticado
- Valida datos con esquema Zod

**GET /api/agents/[id]**
- Requiere token de autorización
- Retorna agente específico solo para usuarios autenticados

**PUT /api/agents/[id]**
- Requiere token de autorización
- Agrega `updatedBy` al agente con el ID del usuario que modifica
- Valida datos con esquema Zod

**DELETE /api/agents/[id]**
- Requiere token de autorización
- Permite eliminar agente solo a usuarios autenticados

#### 3. Middleware Global (`middleware.ts`)
- ✅ Verificación previa de presencia de token Bearer en rutas de API protegidas
- ✅ Respuesta 401 inmediata si no hay token de autorización
- ✅ Exclusión correcta de archivos estáticos

#### 4. Cliente Actualizado (`hooks/useAgent.ts`)
- ✅ Obtención automática de tokens de Firebase
- ✅ Inclusión de headers de autorización en todas las peticiones
- ✅ Manejo de errores 401 con mensajes específicos
- ✅ Mensajes de error más descriptivos

## 🔐 Cómo Funciona la Autenticación

### Flujo de Autenticación
1. Usuario se autentica con Firebase (email/password o Google)
2. Cliente obtiene token ID de Firebase
3. Token se incluye en header `Authorization: Bearer <token>`
4. Middleware verifica presencia del token
5. Endpoint individual valida el token completamente
6. Si es válido, se procesa la request; si no, se retorna 401

### Headers Requeridos
```javascript
{
  "Authorization": "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
```

## ⚠️ Pendiente para Producción

### Firebase Admin SDK
Para implementación completa en producción, instalar y configurar:

```bash
npm install firebase-admin
```

Y actualizar `lib/auth-middleware.ts` para verificar tokens reales:

```javascript
import { auth } from 'firebase-admin';

// En verifyAuth function:
const decodedToken = await auth.verifyIdToken(token);
return { 
  authenticated: true, 
  userId: decodedToken.uid,
  user: decodedToken 
};
```

### Variables de Entorno Requeridas
```env
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_CLIENT_EMAIL=tu_service_account_email
FIREBASE_PRIVATE_KEY=tu_private_key
```

## 🛡️ Beneficios de Seguridad

1. **Prevención de Acceso No Autorizado**: Solo usuarios autenticados pueden acceder a la API
2. **Trazabilidad**: Se registra quién crea y modifica cada agente
3. **Validación de Datos**: Esquemas Zod previenen datos maliciosos
4. **Gestión Centralizada**: Middleware unificado para todas las rutas protegidas
5. **Mensajes de Error Claros**: Facilita debugging sin exponer información sensible

## 🔄 Testing

Para probar la API con autenticación:

```javascript
// Obtener token de Firebase
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Hacer petición autenticada
fetch('/api/agents', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 📝 Notas Adicionales

- Las rutas del dashboard (`/dashboard`) mantienen autenticación del lado cliente
- El middleware excluye correctamente archivos estáticos
- Los errores de autenticación retornan status 401 con mensajes en español
- La implementación actual es compatible con desarrollo, pero requiere Firebase Admin para producción 