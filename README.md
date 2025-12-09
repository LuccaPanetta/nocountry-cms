# 📢 Testimonial CMS – Sistema de Gestion de Testimonios

<h1 align="center">
  <a href="#testimonial-cms--sistema-de-gestion-de-testimonios"><img src="https://res.cloudinary.com/dkkzwhtfx/image/upload/v1765237031/testiGo_isologo-slogan_zyz0wd.svg" width="400" alt="TestiGo Logo"></a>
</h1>

<h3 align="center">📌 Alcance del Proyecto: Testimonial CMS</h3>
<p align="center">
Testimonial CMS es un sistema diseñado para que instituciones, empresas y comunidades puedan **recopilar, organizar y publicar testimonios reales** en múltiples formatos (texto, imagen, video). Permite curaduría, moderación, categorización, embebido en webs externas y analíticas de interacción.
</p>

---

## 📋 **Índice**
1. [🚀 Tecnologías Utilizadas](#-tecnologías-utilizadas)
2. [📌 Descripción del Proyecto](#-descripción-del-proyecto)
3. [🛠️ Instalación Backend](#-instalación-y-configuración-backend)
4. [💻 Instalación Frontend](#-instalación-y-configuración-frontend)
5. [🗄️ Modelo de Datos](#-modelo-de-datos)
6. [📚 Documentación API](#-documentación-de-la-api)
7. [🧪 Pruebas QA](#-escenarios-de-pruebas-qa)
8. [🌐 Deploys](#-deploys)
9. [👥 Contribuidores](#-integrantes)
10. [📌 Trello](#-tablero-de-trello)

---

## 🚀 **Tecnologías Utilizadas**

### **Backend**
- **Framework:** NestJS, TypeScript
- **Base de Datos:** PostgreSQL
- **Multimedia:** Cloudinary, YouTube API
- **Documentación:** Swagger
- **Despliegue (Hosting):** Render

### **Frontend**
- **Framework:** Next.js, React
- **Estilos:** Tailwind CSS
- **Manejo de Estado:** Zustand
- **Despliegue (Hosting):** Vercel

### **Colaboración**
- **Control de Versiones:** GitHub
- **Planificación:** Trello
- **Diseño:** Figma

---

## 📌 **Descripción del Proyecto**

El Testimonial CMS permite:

* **Creación y Edición:** Crear y editar testimonios con texto, imagen o video.
* **Manejo Multimedia:** Integración con Cloudinary y YouTube API.
* **Moderación:** Proceso de moderación antes de la publicación.
* **Clasificación:** Clasificación por categorías, tags e industrias.
* **Integración:** API pública para integración externa y *Embeds* para mostrar testimonios en otros sitios web.
* **Administración:** Dashboard administrativo.

---
## 🛠️ Instalación y Configuración Backend
### **1️⃣ Clonar el Repositorio**
```bash
git clone https://github.com/LuccaPanetta/nocountry-cms
cd nocountry-cms/backend
```

### 2️⃣ **Crear archivo .env**
Crea el archivo de variables de entorno **`.env`** en la raíz del proyecto backend con el siguiente contenido. Recuerda reemplazar los valores de las claves secretas (`JWT_SECRET`, `CLOUDINARY_*`, etc.).

```env
# =======================
# ⚙️ CONFIGURACIÓN APP
# =======================
PORT=3000
NODE_ENV=development
# =======================
# 💾 BASE DE DATOS
# =======================
DATABASE_TYPE=postgres
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASS=postgres
DB_NAME=cms_testimonios
# =======================
# 🔑 JWT
# =======================
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1h
# =======================
# 🌐 DEPLOY
# =======================
RENDER_BACKEND_URL=https://nocountry-cms.onrender.com
VERCEL_FRONTEND_URL=https://nocountry-cms-dusky.vercel.app
VERCEL_FRONTEND_EMBED_TESTER=https://testimonios-embed-tester.vercel.app
# =======================
# ☁️ MULTIMEDIA
# =======================
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3️⃣ **Levantar PostgreSQL con Docker**
```bash 
docker run --name nocountry-pg \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=nocountry-db \
  -p 5432:5432 -d postgres
```

### 4️⃣ **Instalar dependencias del backend**
```bash 
npm install
```

### 5️⃣ **Ejecutar backend**
```bash 
npm run start:dev
```

---
## 💻 Instalación y Configuración Frontend

### 1️⃣ **Ir a la carpeta del Frontend**
```bash
cd nocountry-cms/frontend/testigo-app
```

### 2️⃣ **Instalar Dependencias**
```bash
npm install
```

### 3️⃣ **Crear archivo .env del Frontend**
```bash
NEXT_PUBLIC_URL_BASE=https://nocountry-cms.onrender.com/api/v1
```

### 4️⃣ **Ejecutar Frontend**
```bash
npm run dev
```
---
## 🗄️ Modelo de Datos

### 📌 **Diagrama DER**
<p align="center">
  <img src="https://res.cloudinary.com/dkkzwhtfx/image/upload/v1765245197/DER_-_TestiGo_y0q9os.png" alt="Diagrama Entidad-Relación TestiGo" width="600">
</p>

---
## 📚 Documentación de la API

La API está documentada con **Swagger**. Accede a las especificaciones:

* **🚀 Swagger Producción:**
    [https://nocountry-cms.onrender.com/api/v1/docs](https://nocountry-cms.onrender.com/api/v1/docs)

* **🛠️ Desarrollo local:**
    [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

---
## 🌐 Deploys

| Entorno | Enlace | Notas |
| :--- | :--- | :--- |
| **🚀 Frontend Principal** | [nocountry-cms-dusky.vercel.app](https://nocountry-cms-dusky.vercel.app) | Aplicación administrativa y web pública. |
| **🖥️ Backend (Swagger Docs)** | [nocountry-cms.onrender.com/api/v1/docs](https://nocountry-cms.onrender.com/api/v1/docs) | Documentación de la API desplegada. |
| **🌍 Embed Tester** | [testimonios-embed-tester.vercel.app](https://testimonios-embed-tester.vercel.app/) | Sitio de demostración para probar el componente de *embed* externo. |

---

## 🧪 Escenarios de Pruebas QA

**Docs.**
[Escenario de prueba](https://docs.google.com/document/d/1cnlVvaK5J8MJapNFce8dP8mRrP5CeCZTC69veMHe7Mg/edit?tab=t.0#heading=h.y587ji3hfi4b)

---
## 👥 Integrantes

Puedes ver la lista completa y actualizada de los integrantes del proyecto en el siguiente enlace:

🔗 **Listado completo de colaboradores**
| Rol | Nombre y Apellido | País | Tecnologías | GitHub | LinkedIn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Backend | Delmer Rodríguez | Argentina | Java Spring Boot, React | [DelmerRo](https://github.com/DelmerRo) | [Perfil](https://www.linkedin.com/in/delmer-rodr%C3%ADguez/) |
| Backend | Lucca Panetta | Argentina | Js, Css, HTML, Python | [LuccaPanetta](https://github.com/LuccaPanetta) | [Perfil](https://www.linkedin.com/in/lucca-panetta-51a869212) |
| Frontend | Marina Blanco | Argentina | React, Next.js, Typescript | [Marinitabln](https://github.com/Marinitabln) | [Perfil](https://www.linkedin.com/in/marina-victoria-blanco) |
| Frontend | Oscar Lindo | Ecuador | React, NextJs, TypeScript, TailwindCss | [oscar2697](https://github.com/oscar2697) | [Perfil](https://www.linkedin.com/in/oscar-lindo-13071319b/) |
| Backend | Jose Gaspar | Peru | Nest.js | [GasparU](https://github.com/GasparU) | [Perfil](https://www.linkedin.com/in/josegasparunzueta/) |
| Frontend | Gastón F. N. Gómez | Argentina | React, Nextjs, Typescript, Tailwindcss, Node. | [Morfeo1997](https://github.com/Morfeo1997) | [Perfil](https://www.linkedin.com/in/gaston-gomez1997/) |
| QA Tester | Carla Abigail Jimenez | Argentina | | [Carliabi](https://github.com/Carliabi) | |
| Frontend | Ramiro Cosa | Argentina | | [RadikeCosa](https://github.com/RadikeCosa) | [Perfil](https://www.linkedin.com/in/ramicosa/) |

---

## 📌 **Tablero de Trello**

Consulta el progreso de las tareas y el flujo de trabajo en el tablero de Trello:
🔗 [Trello](https://trello.com/b/hvlF7fCH/plataforma-web-de-servicios-financieros-wallex)
