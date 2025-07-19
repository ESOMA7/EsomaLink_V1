
# Documentación Técnica del Proyecto: EsomaLink

**Versión:** 1.0
**Fecha:** 24 de julio de 2024
**Resumen:** Un panel de control avanzado para la gestión de una clínica de estética, con funcionalidades de calendario, pagos, intervenciones y notas, potenciado por IA para la generación de respuestas.

## Tabla de Contenidos
1.  [Resumen del Proyecto](#1-resumen-del-proyecto)
2.  [Arquitectura de la Aplicación](#2-arquitectura-de-la-aplicación)
3.  [Estructura de Archivos Clave](#3-estructura-de-archivos-clave)
4.  [Flujo de Datos y Lógica de Estado](#4-flujo-de-datos-y-lógica-de-estado)
5.  [Guía de Configuración y Puesta en Marcha](#5-guía-de-configuración-y-puesta-en-marcha)
6.  [Lógica de Negocio por Módulo](#6-lógica-de-negocio-por-módulo)
7.  [Próximos Pasos de Desarrollo](#7-próximos-pasos-de-desarrollo)

---

### 1. Resumen del Proyecto

**EsomaLink** es una aplicación web de tipo SPA (Single-Page Application) diseñada para centralizar y optimizar las operaciones diarias de una clínica de estética. La aplicación provee un dashboard intuitivo que permite gestionar citas de pacientes, registrar pagos, dar seguimiento a intervenciones y tomar notas privadas, con el objetivo de mejorar la eficiencia y la comunicación.

### 2. Arquitectura de la Aplicación

La aplicación utiliza una **arquitectura híbrida y desacoplada**, diseñada para ser segura, escalable y mantenible.

*   **Frontend:**
    *   **Framework:** React 19
    *   **Lenguaje:** TypeScript
    *   **Estilos:** TailwindCSS
    *   **Renderizado:** Del lado del cliente (CSR).

*   **Backend y Servicios Externos:** La lógica de backend está distribuida entre varios servicios para optimizar la seguridad y funcionalidad.

    *   **Autenticación y Base de Datos (Notas):**
        *   **Servicio:** **Supabase**
        *   **Autenticación:** El inicio de sesión se realiza a través del proveedor **OAuth de Google** gestionado por Supabase.
        *   **Base de Datos:** Se utiliza la base de datos PostgreSQL de Supabase, pero **únicamente para almacenar el módulo de "Notas"**. La seguridad a nivel de fila (RLS) está configurada para que cada usuario solo pueda acceder a sus propias notas.

    *   **Inteligencia Artificial (Asistente de IA):**
        *   **Servicio:** **Google Gemini API** (`gemini-2.5-flash`).
        *   **Implementación Segura:** La clave de la API de Gemini **NO** está expuesta en el frontend. Las llamadas a la IA se realizan a través de una **Edge Function de Supabase** (`generate-response`), que actúa como un proxy seguro. El frontend llama a la Edge Function, y esta, desde el servidor, llama a la API de Gemini.

    *   **Módulos de Negocio (Citas, Pagos, Intervenciones):**
        *   **Servicios Finales:** **Google Calendar API** y **Google Sheets API**.
        *   **Implementación Futura:** La comunicación con estas APIs se debe realizar a través de un **backend propio (ej. Vercel Serverless Functions)** para manejar de forma segura el flujo de OAuth 2.0 y la lógica de negocio.
        *   **Estado Actual:** El frontend está preparado para esta arquitectura. Llama a un servicio `googleApiService.ts` que contiene funciones de **marcador de posición (placeholder)**. El siguiente paso del desarrollo es implementar el backend y reemplazar estas funciones de placeholder con llamadas `fetch` a los endpoints de la API del backend.

#### Diagrama de Flujo de Datos:

```
                                     ┌──────────────────────────┐
                                     │    APIs de Google        │
                                     │ (Calendar, Sheets)       │
                                     └───────────▲──────────────┘
                                                 │ (OAuth 2.0)
┌────────────────┐      ┌────────────────────────┴───────────────────────┐
│  Usuario       ├─────►│         Frontend (React App en Vercel)         │
└────────────────┘      │                                                │
                        │ 1. Llama a googleApiService.ts (placeholders)  │
                        │ 2. Llama a supabaseClient.ts (Auth, Notas)     │
                        │ 3. Llama a aiService.ts (IA)                   │
                        └──────────┬──────────────┬──────────────┬───────┘
                                   │              │              │
           (Llamadas a API)        │              │              │
                                   ▼              ▼              ▼
           ┌───────────────────────┴──┐  ┌────────┴────────┐  ┌───┴─────────────┐
           │ Backend Propio           │  │   Supabase DB   │  │ Supabase Edge   │
           │ (Vercel Serverless Func) │  │   (PostgreSQL)  │  │   Function      │
           │ - Conecta con Google API │  │ - Módulo "Notas"│  │ - Proxy para IA │
           └──────────────────────────┘  └─────────────────┘  └───────▲─────────┘
                                                                     │ (API Key Segura)
                                                                     ▼
                                                          ┌───────────────────┐
                                                          │ Google Gemini API │
                                                          └───────────────────┘
```

### 3. Estructura de Archivos Clave

*   `/index.html`: Punto de entrada de la aplicación. Configura TailwindCSS y el `importmap` para las dependencias.
*   `/index.tsx`: Monta la aplicación de React en el DOM.
*   `/App.tsx`: Componente raíz. Gestiona la vista principal, el enrutamiento simulado, los estados de los modales y orquesta los hooks de datos.
*   `/types.ts`: Define las interfaces de datos locales (ej. `AppointmentEvent`, `Payment`).
*   `/types/supabase.ts`: Define los tipos generados para la base de datos de Supabase. **Esencial para la seguridad de tipos con el cliente de Supabase.**
*   `/constants.ts`: Constantes de la aplicación, como URLs de assets y datos iniciales (actualmente no se usan para la lógica principal).
*   `/components/`:
    *   `/views/`: Componentes de pantalla completa para cada módulo (`DashboardView`, `CalendarView`, etc.).
    *   `/ui/`: Componentes reutilizables como modales (`ConfirmationModal`), tarjetas (`InfoCard`), esqueletos de carga, etc.
    *   `/calendar/`: Componentes específicos para la vista de calendario (`MonthView`).
*   `/hooks/`: Contiene la lógica de estado y comunicación con los servicios. Cada hook (`useAuth`, `useNotes`, etc.) es responsable de un dominio de datos.
*   `/services/`:
    *   `supabaseClient.ts`: Inicializa y exporta el cliente de Supabase. **Aquí se deben configurar la URL y la Anon Key.**
    *   `aiService.ts`: Llama de forma segura a la Edge Function de Supabase para la IA.
    *   `googleApiService.ts`: **Contiene los placeholders** para las futuras llamadas al backend que se conectará con Google Calendar y Sheets.
*   `/supabase/`:
    *   `schema.sql`: Contiene el DDL para crear la tabla `notes` y sus políticas de seguridad (RLS). **Debe ejecutarse en el editor SQL de Supabase.**
    *   `/functions/generate-response/index.ts`: El código de la Edge Function que actúa como proxy seguro para la API de Gemini.

### 4. Flujo de Datos y Lógica de Estado

La aplicación sigue un patrón de **hooks personalizados** para la gestión del estado.

1.  **Orquestador:** El componente `App.tsx` es el padre de toda la aplicación.
2.  **Inicialización de Hooks:** En `App.tsx`, se inicializan todos los hooks (`useAuth`, `useAppointments`, etc.). El hook `useAuth` es el primero; determina si el usuario está autenticado.
3.  **Paso de Datos y Funciones:** `App.tsx` pasa los datos (ej. `notes`) y las funciones de acción (ej. `handleSaveNote`) como props a los componentes de vista correspondientes.
4.  **Aislamiento de Lógica:** Cada hook es una unidad autónoma:
    *   Gestiona su propio estado (`useState`), incluyendo datos, estado de carga y errores.
    *   Contiene la lógica para comunicarse con su servicio correspondiente (Supabase, `googleApiService`).
    *   Expone una API simple (`{ data, isLoading, error, saveData, deleteData }`) al resto de la aplicación.

### 5. Guía de Configuración y Puesta en Marcha

Para llevar este proyecto del código fuente a una aplicación funcional, sigue estos pasos:

**Prerrequisitos:**
*   Node.js y npm/yarn.
*   Cuenta de GitHub.
*   Cuenta de Vercel.
*   Cuenta de Supabase.
*   Cuenta de Google Cloud Platform.
*   [Supabase CLI](https://supabase.com/docs/guides/cli) instalada localmente.

**Pasos:**
1.  **Clonar el Repositorio:** `git clone <url_del_repositorio>`
2.  **Variables de Entorno Locales:**
    *   En este proyecto, las claves se configuran directamente en los archivos de servicio para simplificar el entorno de desarrollo sin un bundler como Vite. Para producción, estas claves deben moverse a variables de entorno de Vercel.
    *   **Edita `services/supabaseClient.ts`** con tu URL y clave anónima de Supabase.
    *   **Edita `services/aiService.ts`** para añadir tu clave de Gemini si quieres probar la funcionalidad de IA en local (no recomendado para producción).
3.  **Configurar Supabase:**
    *   Crea un nuevo proyecto en [Supabase.com](https://supabase.com/).
    *   Ve a **Project Settings > API** y copia la URL y la `anon` key. Pégalas en `services/supabaseClient.ts`.
    *   Ve al **SQL Editor**, copia todo el contenido de `supabase/schema.sql` y ejecútalo.
    *   Ve a **Authentication > Providers** y activa **Google**. Sigue las instrucciones para añadir tu Client ID y Secret de Google Cloud.
    *   **Desplegar la Edge Function:**
        *   En tu terminal, en la raíz del proyecto, ejecuta `supabase login` y `supabase link --project-ref TU_ID_DE_PROYECTO`.
        *   Añade tu clave de Gemini como un secreto: `supabase secrets set GEMINI_API_KEY=tu_clave_de_gemini`.
        *   Despliega la función: `supabase functions deploy generate-response`.
4.  **Desplegar en Vercel:**
    *   Conecta tu repositorio de GitHub a Vercel.
    *   En la configuración del proyecto en Vercel, ve a **Settings > Environment Variables** y añade las claves para Supabase y Gemini. **Importante:** Deberás modificar el código para que lea estas variables de entorno en lugar de tenerlas hardcodeadas para que el despliegue de Vercel funcione. Este es un paso de refactorización necesario para producción.
5.  **Ejecutar Localmente:**
    *   Asegúrate de haber reemplazado las claves en los archivos de servicio.
    *   Abre el `index.html` en un servidor web local (ej. con la extensión Live Server de VS Code).

### 6. Lógica de Negocio por Módulo

*   **Autenticación:**
    *   **Flujo:** `LoginView` -> `useAuth.loginWithGoogle()` -> `supabase.auth.signInWithOAuth({ provider: 'google' })`.
    *   Supabase maneja el redireccionamiento y la sesión. `useAuth` escucha los cambios de estado de autenticación.

*   **Notas (Supabase):**
    *   **CRUD:** `useNotes` se comunica directamente con la tabla `notes` de Supabase.
    *   **Lectura:** `supabase.from('notes').select('*')`.
    *   **Escritura:** `supabase.from('notes').upsert({ ... })`. Usa `upsert` para crear o actualizar.
    *   **Seguridad:** La RLS en `schema.sql` asegura que `user_id` coincida con el `auth.uid()` del usuario autenticado.

*   **Citas, Pagos, Intervenciones (Google API - Placeholder):**
    *   **Flujo:** `Componente de Vista` -> `Hook (ej. useAppointments)` -> `googleApiService`.
    *   **Estado Actual:** `googleApiService` devuelve datos vacíos o simulados.
    *   **Tarea de Desarrollo:** Implementar un backend (ej. en la carpeta `/api` de Vercel) que maneje el OAuth de Google y realice las llamadas a las APIs de Calendar/Sheets. Luego, actualizar `googleApiService` para que haga `fetch` a esos endpoints del backend.

*   **Asistente IA (Gemini):**
    *   **Flujo:** `GeminiModal` -> `aiService.generateInterventionResponse()` -> `supabase.functions.invoke('generate-response', { body: ... })`.
    *   **Seguridad:** La clave de la API está segura en los secretos de Supabase y solo la Edge Function puede acceder a ella.

### 7. Próximos Pasos de Desarrollo

1.  **Implementar Backend para Google APIs:**
    *   Crear endpoints serverless (ej. en una carpeta `/api`) compatibles con Vercel.
    *   Implementar el flujo de OAuth 2.0 para que la aplicación pueda solicitar permisos al usuario para acceder a su Google Calendar y Sheets.
    *   Usar librerías como `googleapis` en el backend para interactuar con las APIs.
2.  **Conectar Frontend al Nuevo Backend:**
    *   Actualizar las funciones en `services/googleApiService.ts` para que hagan `fetch` a los nuevos endpoints de la API en lugar de retornar datos de placeholder.
3.  **Desarrollar la Vista de Google Drive:**
    *   Crear un nuevo endpoint de backend para interactuar con la Google Drive API.
    *   Construir la interfaz en `components/views/DriveView.tsx` para listar, buscar y previsualizar archivos.
4.  **Refinar la Experiencia de Usuario:**
    *   Mejorar la gestión de errores y los mensajes para el usuario.
    *   Añadir optimismo en las actualizaciones de UI para una sensación más rápida.
5.  **Testing:**
    *   Implementar pruebas unitarias para los hooks y componentes críticos.
