# SamaraCore - Plataforma de Agentes IA

Una plataforma SaaS moderna para crear y configurar agentes de inteligencia artificial personalizados.

## 🚀 Características

- **Autenticación completa** con Firebase (Email + Google)
- **Editor visual** para configurar agentes IA
- **Editor JSON** para configuración avanzada
- **Dashboard intuitivo** para gestionar agentes
- **Diseño moderno** con ShadCN UI + TailwindCSS
- **Base de datos** MongoDB Atlas
- **Desplegable en Vercel** con App Router

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, React
- **UI**: ShadCN UI, TailwindCSS, Lucide Icons
- **Autenticación**: Firebase Auth
- **Base de datos**: MongoDB Atlas
- **Validación**: Zod
- **Despliegue**: Vercel

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd SamaraCore
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/samaracore?retryWrites=true&w=majority
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Firebase Setup

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication con Email/Password y Google
4. Copia las credenciales a tu `.env.local`

### MongoDB Atlas Setup

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un cluster gratuito
3. Configura un usuario de base de datos
4. Obtén la cadena de conexión
5. Reemplaza `<password>` con tu contraseña real

### Vercel Deployment

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

## 📁 Estructura del Proyecto

```
SamaraCore/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   └── agents/              # Endpoints de agentes
│   │   └── auth/                # Páginas de autenticación
│   │   └── dashboard/           # Dashboard principal
│   │   └── globals.css          # Estilos globales
│   │   └── layout.tsx           # Layout principal
│   │   └── page.tsx             # Landing page
│   ├── components/              # Componentes reutilizables
│   │   └── ui/                 # Componentes de ShadCN UI
│   ├── hooks/                  # Hooks personalizados
│   │   ├── useAuth.ts          # Hook de autenticación
│   │   └── useAgent.ts         # Hook para agentes
│   ├── lib/                   # Utilidades y configuración
│   │   ├── firebase.ts         # Configuración Firebase
│   │   ├── mongodb.ts          # Conexión MongoDB
│   │   ├── schemas.ts          # Esquemas Zod
│   │   └── utils.ts            # Utilidades generales
│   └── README.md
```

## 🎯 Funcionalidades Principales

### 1. Landing Page (`/`)
- Hero section con CTA
- Características principales
- Navegación al login

### 2. Autenticación
- **Login** (`/auth/login`): Email + Google
- **Registro** (`/auth/register`): Email + Google
- Redirección automática al dashboard

### 3. Dashboard (`/dashboard`)
- Bienvenida personalizada
- Lista de agentes existentes
- Acciones rápidas (crear agente)
- Navegación a editor de agentes

### 4. Editor de Agentes (`/dashboard/agents/[id]`)
- **Editor Visual**: Formulario intuitivo
- **Editor JSON**: Configuración avanzada
- Configuración de:
  - Información básica (ID, nombre, descripción)
  - Herramientas disponibles
  - Prompt completo (base, reglas, ejemplos, etc.)

### 5. API Routes
- `GET /api/agents` - Listar agentes
- `POST /api/agents` - Crear agente
- `GET /api/agents/[id]` - Obtener agente específico
- `PUT /api/agents/[id]` - Actualizar agente
- `DELETE /api/agents/[id]` - Eliminar agente

## 🔧 Esquema de Datos

### Agente
```typescript
{
  agentId: string;           // ID único
  agentName: string;         // Nombre del agente
  description: string;       // Descripción
  prompt: {
    base: string;            // Prompt base
    examples: string;        // Ejemplos
    rules: string;           // Reglas
    decision_logic: string;  // Lógica de decisión
    response_format: string; // Formato de respuesta
    other_instructions: string; // Otras instrucciones
  };
  agents: string[];          // Sub-agentes
  tools: string[];           // Herramientas habilitadas
}
```

## 🎨 Personalización

### Temas
El proyecto incluye soporte completo para dark mode usando CSS variables. Los temas se pueden personalizar en `app/globals.css`.

### Componentes
Todos los componentes UI están basados en ShadCN UI y se pueden personalizar fácilmente.

## 🚀 Próximos Pasos

1. **Implementar autenticación en API Routes** - Filtrar agentes por usuario
2. **Agregar más herramientas** - Expandir catálogo de herramientas
3. **Sistema de ejecución** - Conectar con backend de ejecución
4. **Analytics** - Métricas de uso de agentes
5. **Colaboración** - Compartir agentes entre usuarios

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, puedes:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

---

¡Gracias por usar SamaraCore! 🚀 