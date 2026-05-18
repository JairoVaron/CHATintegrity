
# CHATintegrity
## Plataforma de Comunicación Empresarial en Tiempo Real

CHATintegrity es una aplicación web de mensajería en tiempo real desarrollada con Node.js, Socket.IO y PostgreSQL.  

El sistema fue diseñado como una solución de comunicación interna para organizaciones o empresas, permitiendo interacción global y privada entre usuarios conectados en tiempo real mediante una plataforma web moderna y accesible desde cualquier navegador.

---

# Características Principales

- Registro de usuarios.
- Inicio y cierre de sesión.
- Chat global en tiempo real.
- Mensajería privada entre usuarios.
- Reacciones mediante emojis.
- Visualización de usuarios conectados.
- Persistencia de mensajes.
- Comunicación mediante WebSockets.
- Arquitectura cliente-servidor.
- Despliegue cloud en Render.

---

# Tecnologías Utilizadas

## Backend
- Node.js
- Express.js
- Socket.IO

## Frontend
- HTML5
- CSS3
- JavaScript

## Base de Datos
- PostgreSQL
- Supabase

## Infraestructura Cloud
- Render.com

## Herramientas de Desarrollo
- Git
- GitHub
- Visual Studio Code
- Trello / Kanban

---

# Arquitectura del Sistema

El sistema implementa una arquitectura cliente-servidor dividida en tres capas:

- **Frontend:** interfaz web desarrollada con HTML, CSS y JavaScript.
- **Backend:** servidor Node.js encargado de autenticación, lógica de negocio y WebSockets.
- **Base de Datos:** PostgreSQL administrado mediante Supabase.

La comunicación en tiempo real se realiza utilizando Socket.IO sobre WebSockets.

---

# Instalación del Proyecto

## 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/chatintegrity.git
cd chatintegrity
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/database
SESSION_SECRET=tu_clave_secreta
PORT=3000
```

---

## 4. Ejecutar el servidor

```bash
npm start
```

o

```bash
node server.js
```

---

## 5. Acceder desde el navegador

```txt
http://localhost:3000
```

---

# Estructura del Proyecto

```txt
/CHATintegrity
│
├── /public
│   ├── /css
│   ├── /js
│   ├── /img
│   └── index.html
│
├── /routes
│
├── /config
│
├── server.js
├── package.json
├── package-lock.json
└── .env
```

---

# Despliegue

La aplicación se encuentra desplegada en Render:

https://chatintegrity.onrender.com/

---

# Funcionalidades Implementadas

| Funcionalidad | Estado |
|---|---|
| Registro de usuarios | Implementado |
| Inicio de sesión | Implementado |
| Chat global | Implementado |
| Mensajes privados | Implementado |
| Usuarios en línea | Implementado |
| Reacciones con emojis | Implementado |
| Persistencia de mensajes | Implementado |

---

# Proyecto Académico

Proyecto desarrollado como trabajo final para la asignatura de Ingeniería de Software.

**Universidad de La Guajira**  
Facultad de Ingeniería  
2026

---

# Licencia

Este proyecto fue desarrollado con fines académicos y educativos.
