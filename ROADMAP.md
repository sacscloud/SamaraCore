# 🚀 SamaraCore + Core Agent - Roadmap de Desarrollo

## 📊 Resumen Ejecutivo

Plan de desarrollo incremental para el ecosistema completo de agentes IA:
- **SamaraCore**: Frontend + UI + Configuraciones (Next.js)
- **Core Agent**: Backend de ejecución (Clean Architecture)

**Total estimado**: 5-6 semanas | **6 Fases incrementales**

---

## 🎯 FASE 1: CRUD Agentes + Ejecución Básica
**Duración**: 1 semana  
**Objetivo**: Crear y ejecutar agentes básicos sin herramientas

### 📱 SamaraCore Entregables:
- ✅ CRUD completo de agentes (crear, listar, editar, eliminar)
- ✅ UI para configurar prompt completo:
  - Prompt base
  - Lista de objetivos (agregar/eliminar)
  - Lista de reglas (agregar/eliminar)  
  - Ejemplos de interacción
- ✅ UI básica para probar agentes en tiempo real
- ✅ API routes en Next.js para CRUD de agentes
- ✅ Conexión a MongoDB para persistencia

### 🤖 Core Agent Entregables:
- ✅ Agent executor básico (solo prompt + LLM)
- ✅ Endpoint REST: `POST /execute/:agentId`
- ✅ `GET /execute/:agentId/info` para metadata
- ✅ Lectura de configuración desde MongoDB (solo lectura)
- ✅ Integración básica con OpenAI/LLM
- ✅ Respuesta estructurada con metadata

### ✔️ Criterios de Validación Fase 1:
1. **Crear 3 agentes diferentes** desde SamaraCore UI:
   - Agente de ventas
   - Agente de soporte técnico  
   - Agente analista
2. **Probar cada agente** vía REST API external
3. **Confirmar comportamiento diferenciado** según prompt configurado
4. **UI intuitiva** para usuarios no técnicos

### 🔗 APIs Funcionales:
```
POST /api/agents              # Crear agente
GET /api/agents               # Listar agentes
PUT /api/agents/:id           # Actualizar agente
DELETE /api/agents/:id        # Eliminar agente

POST /execute/:agentId        # Ejecutar agente
GET /execute/:agentId/info    # Info del agente
```

---

## 🔄 FASE 2: Multi-Agente Básico
**Duración**: 3-4 días  
**Objetivo**: Orquestación automática entre agentes

### 📱 SamaraCore Entregables:
- ✅ UI para asignar sub-agentes a agente principal
- ✅ Configuración de orquestación (enable/disable)
- ✅ UI para configurar condiciones de invocación
- ✅ Selector de agentes existentes como sub-agentes
- ✅ Configuración de profundidad máxima

### 🤖 Core Agent Entregables:
- ✅ Lógica de orquestación automática
- ✅ Detección heurística de necesidad de sub-agentes
- ✅ Ejecución secuencial de sub-agentes
- ✅ Combinación inteligente de resultados
- ✅ Prevención de loops infinitos
- ✅ Context passing entre agentes

### ✔️ Criterios de Validación Fase 2:
1. **Agente principal** que invoca automáticamente 2 sub-agentes
2. **Casos positivos**: Queries que SÍ activan orquestación
3. **Casos negativos**: Queries que NO activan orquestación  
4. **Resultados combinados** coherentemente
5. **Control de profundidad** funcionando (no más de 3 niveles)

### 📋 Casos de Prueba:
```
Query: "Dame un análisis completo de ventas"
→ Agente Principal → Sub-Agente Analista → Resultados combinados

Query: "Hola, ¿cómo estás?"  
→ Solo Agente Principal (sin orquestación)
```

---

## 🛠️ FASE 3: Sistema de Herramientas
**Duración**: 1 semana  
**Objetivo**: Integrar herramientas funcionales

### 📱 SamaraCore Entregables:
- ✅ **Tool Store UI** - Catálogo de herramientas disponibles
- ✅ **Tool Setup** - UI para configurar credenciales
- ✅ **Tool Assignment** - UI para asignar herramientas a agentes
- ✅ **Credential Manager** - CRUD de credenciales encriptadas
- ✅ **Tool Configuration** - Configuración específica por agente
- ✅ Tool testing - Probar conexiones antes de asignar

### 🤖 Core Agent Entregables:
- ✅ **Tool Engine** con Factory pattern
- ✅ **MongoDB Tool**: Query natural language a MongoDB
- ✅ **HTTP Request Tool**: APIs REST genéricas
- ✅ **Tool Integration** en ejecución de agentes
- ✅ **Credential decryption** y manejo seguro
- ✅ **Tool error handling** robusto

### ✔️ Criterios de Validación Fase 3:
1. **Configurar MongoDB tool** desde SamaraCore UI
2. **Agente consulta base de datos** automáticamente
3. **Agente hace HTTP requests** a APIs externas  
4. **Herramientas funcionan en orquestación** (sub-agentes con tools)
5. **Manejo de errores** de herramientas
6. **Credenciales seguras** (encriptadas en DB)

### 🔧 Herramientas Implementadas:
```
mongodb_query:
- Natural language → MongoDB queries  
- Configuración: URI, database, colecciones permitidas

http_request:  
- REST API calls
- Configuración: URL, método, headers, auth
```

---

## 🎨 FASE 4: UX Completa  
**Duración**: 3-4 días  
**Objetivo**: Experiencia de usuario pulida

### 📱 SamaraCore Entregables:
- ✅ **Dashboard** con métricas y estadísticas
- ✅ **Agent Builder mejorado** (wizard multi-step)
- ✅ **Sistema de pruebas integrado** (test agent desde UI)
- ✅ **Tool management avanzado** (editar, deshabilitar, logs)
- ✅ **Error handling elegante** en toda la UI
- ✅ **Loading states** y feedback visual

### 🤖 Core Agent Entregables:
- ✅ **Robust error handling** con mensajes descriptivos
- ✅ **Logging y métricas** básicas (execution time, success rate)
- ✅ **Timeout y retry logic** para herramientas
- ✅ **Performance optimizations** (caching, connection pooling)
- ✅ **Health checks** endpoint

### ✔️ Criterios de Validación Fase 4:
1. **Experiencia fluida** de principio a fin
2. **Manejo elegante** de todos los tipos de errores
3. **UI intuitiva** para usuarios no técnicos
4. **Performance aceptable** (< 5 segundos respuesta)
5. **Feedback visual** en todas las operaciones

---

## 🚀 FASE 5: Deployment Channels
**Duración**: 1 semana  
**Objetivo**: Conectar agentes a plataformas externas

### 📱 SamaraCore Entregables:
- ✅ **Deployment Manager UI** - Gestión de canales activos
- ✅ **Channel Configuration** - Setup para Slack, Discord, etc.
- ✅ **Deployment Status** - Monitoreo de canales activos
- ✅ **Channel Analytics** - Métricas por canal

### 🤖 Core Agent Entregables:
- ✅ **Slack Bot Channel** - Bot automático para Slack
- ✅ **Discord Bot Channel** - Bot automático para Discord  
- ✅ **REST API Channel** - Endpoint personalizable
- ✅ **Webhook Receivers** - Recibir eventos externos
- ✅ **Channel Factory Pattern** - Arquitectura escalable

### ✔️ Criterios de Validación Fase 5:
1. **Agente funcionando en Slack** (menciones y DMs)
2. **Agente funcionando en Discord** (menciones y DMs)
3. **Multiple channels simultáneos** para un mismo agente
4. **Deployment automático** desde UI
5. **Desactivación/activación** de canales

### 📡 Canales Implementados:
```
slack_bot: Bot automático en Slack workspace
discord_bot: Bot automático en Discord server  
rest_api: Endpoint REST personalizable
webhook: Recibir eventos HTTP externos
```

---

## ⚡ FASE 6: Herramientas Avanzadas
**Duración**: 1-2 semanas  
**Objetivo**: Ecosystem completo de herramientas

### 📱 SamaraCore Entregables:
- ✅ **Custom Tool Builder** - Crear herramientas custom
- ✅ **Tool Marketplace** - Herramientas de la comunidad
- ✅ **Advanced Tool Management** - Versioning, sharing
- ✅ **Tool Analytics** - Uso y performance de herramientas

### 🤖 Core Agent Entregables:
- ✅ **MCP Integration** - Model Context Protocol tools
- ✅ **LangChain Tools** - Integración con ecosystem LangChain
- ✅ **Dynamic Tool Loading** - Cargar herramientas en runtime
- ✅ **Tool Versioning** - Manejo de versiones de herramientas
- ✅ **Advanced Tool Types** - OAuth, webhooks, custom protocols

### ✔️ Criterios de Validación Fase 6:
1. **Usuario crea herramienta custom** desde UI
2. **Integración con herramientas populares** (Shopify MCP, etc.)
3. **Ecosystem escalable** de herramientas
4. **Tool marketplace** funcional
5. **Community contributions** habilitadas

---

## 🌐 FASE 7: Widget Embebido
**Duración**: 1 semana  
**Objetivo**: Chat embebido para integrar en sitios web externos

### 📱 SamaraCore Entregables:
- ⏳ **Embed Builder UI** - Generador de código para embedding
- ⏳ **Widget Configuration** - Personalización visual y funcional
- ⏳ **Embed Page** - Página optimizada para iframe (`/embed`)
- ⏳ **Widget Analytics** - Métricas de uso del widget
- ⏳ **Embed Management** - Dashboard para gestionar embeds activos

### 🤖 Core Agent Entregables:
- ⏳ **Widget API** - Endpoints específicos para widgets
- ⏳ **CORS Configuration** - Configuración segura para embeds
- ⏳ **Widget Authentication** - Sistema de autenticación para embeds
- ⏳ **Rate Limiting** - Control de uso para widgets públicos

### 📦 Widget.js Entregables:
- ⏳ **Widget Loader Script** - JavaScript vanilla ligero (~300 líneas)
- ⏳ **Iframe Integration** - Creación y manejo de iframe
- ⏳ **Cross-domain Communication** - postMessage API
- ⏳ **Widget Positioning** - Sistema de posicionamiento flexible
- ⏳ **Theme Customization** - Personalización de colores y estilos

### ✔️ Criterios de Validación Fase 7:
1. **Generar código de embedding** desde SamaraCore UI
2. **Widget funcionando** en sitio web externo
3. **Personalización visual** (colores, posición, tamaño)
4. **Comunicación bidireccional** entre widget y chat
5. **Analytics de uso** del widget
6. **Múltiples widgets** en sitios diferentes

### 🎯 Casos de Uso:
```
E-commerce: Widget de soporte al cliente
SaaS: Ayuda contextual en aplicaciones
Corporate: Asistente virtual en sitio web
Documentación: Chat de ayuda técnica
```

### 🛠️ Implementación Técnica:
```javascript
// Código generado para sitios externos
<script>
(function(w,d,s,o,f,js,fjs){
  w['SamaraChatObject']=o;w[o]=w[o]||function(){
  (w[o].q=w[o].q||[]).push(arguments)};w[o].l=1*new Date();
  js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
  js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
})(window,document,'script','SamaraChat','https://chat.samaracore.com/widget.js');

SamaraChat('init', {
  agentId: 'abc123',
  theme: 'light',
  position: 'bottom-right'
});
</script>
```

---

## 📊 Timeline y Milestones

| Fase | Duración | Milestone | Validación |
|------|----------|-----------|------------|
| **1** | 1 semana | Agentes básicos funcionando | 3 agentes diferentes ejecutándose |
| **2** | 3-4 días | Multi-agente automático | Orquestación funcionando |
| **3** | 1 semana | Herramientas integradas | MongoDB + HTTP tools working |
| **4** | 3-4 días | UX pulida | Experiencia fluida end-to-end |
| **5** | 1 semana | Deployment channels | Slack + Discord + REST |
| **6** | 1-2 semanas | Ecosystem completo | MCP + LangChain + Custom tools |
| **7** | 1 semana | Widget embebido | Chat funcionando en sitios externos |

**Total**: 6-7 semanas para MVP completo + Widget

---

## 🎯 Definición de "Done" por Fase

### ✅ Fase 1 Completa:
- [ ] Crear agente desde cero en UI
- [ ] Agente responde correctamente vía REST
- [ ] 3 agentes diferentes con comportamientos distintos
- [ ] Code review y testing básico

### ✅ Fase 2 Completa:
- [ ] Agente principal llama automáticamente sub-agentes
- [ ] Orquestación se puede enable/disable desde UI
- [ ] Resultados se combinan correctamente
- [ ] Control de profundidad funcionando

### ✅ Fase 3 Completa:
- [ ] Herramientas se configuran desde UI
- [ ] Agentes usan herramientas automáticamente  
- [ ] MongoDB y HTTP requests funcionando
- [ ] Credenciales encriptadas y seguras

### ✅ Fase 4 Completa:
- [ ] UI pulida y user-friendly
- [ ] Error handling robusto
- [ ] Performance aceptable (< 5s)
- [ ] Dashboard con métricas básicas

### ✅ Fase 5 Completa:
- [ ] Slack bot deployado y funcionando
- [ ] Discord bot deployado y funcionando
- [ ] Multiple channels simultáneos
- [ ] Deployment desde UI

### ✅ Fase 6 Completa:
- [ ] MCP integration funcionando
- [ ] Tool builder para herramientas custom
- [ ] Ecosystem escalable
- [ ] Documentation completa

### ✅ Fase 7 Completa:
- [ ] Widget.js generado y funcionando
- [ ] Embed builder UI operativo
- [ ] Widget deployado en sitio externo
- [ ] Analytics de widget funcionando
- [ ] Personalización visual completa

---

## 🚧 Riesgos y Mitigaciones

### 🔴 Riesgos Técnicos:
- **LLM API limits**: Implementar rate limiting y fallbacks
- **MongoDB performance**: Optimizar queries y indexing  
- **Tool authentication**: Manejo robusto de credenciales
- **Multi-agent loops**: Controles de profundidad y timeout

### 🟡 Riesgos de Producto:
- **UX complexity**: Validación continua con usuarios
- **Feature creep**: Stick to roadmap, features adicionales a backlog
- **Performance issues**: Monitoring desde Fase 4

### 🟢 Mitigaciones:
- **Testing incremental** en cada fase
- **User feedback** temprano y frecuente  
- **Architecture review** antes de Fase 3
- **Performance baseline** establecido en Fase 1

---

## 📝 Notas de Implementación

### 🏗️ Arquitectura:
- **SamaraCore**: Next.js 14 + App Router + MongoDB + Firebase Auth
- **Core Agent**: Node.js + Express + Clean Architecture + MongoDB (read-only)
- **Database**: MongoDB compartido (SamaraCore escribe, Core Agent lee)

### 🔧 Tech Stack:
- **Frontend**: React + TypeScript + ShadCN UI + TailwindCSS
- **Backend**: Node.js + Express + LangChain + OpenAI API
- **Database**: MongoDB Atlas
- **Auth**: Firebase Authentication
- **Deployment**: Vercel (SamaraCore) + Railway/Render (Core Agent)

---

**Última actualización**: {{ date }}  
**Próxima revisión**: Al completar cada fase 