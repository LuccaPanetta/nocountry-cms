# Instrucciones para construir el frontend de login compatible con el backend dado

## 1. Entorno y herramientas

- Usa React con Next.js (preferiblemente versión con soporte para React Server Components).
- Utiliza librerías como Zustand para el estado global del usuario y React Query para las mutaciones y peticiones al backend.
- Emplea Zod para la validación de formularios.

## 2. Componentes principales

### a. Formulario de Login

- Construye un `<LoginForm />` que utilice `react-hook-form` junto con el esquema de validación de Zod.
  - Campos requeridos: `email` y `password`.
  - Las validaciones deben ser equivalentes a las del backend (mínimo 6 caracteres para password, formato de email válido).
  - Muestra errores de validación en cada campo.

### b. Servicio de login

- Implementa un servicio que envíe una petición POST al endpoint `/auth/login` del backend.
  - Envía `{ email, password }` como JSON.
  - El backend responde con un JWT si las credenciales son válidas.
  - Captura y traduce errores comunes (usuario invalido, contraseña incorrecta, usuario no verificado) tal como maneja el backend.
  - Si el login es exitoso, almacena el token y datos del usuario en un store global (ej: Zustand).

### c. Manejo del estado del usuario

- Implementa un store (ej: Zustand) con los siguientes campos: `idUser`, `email`, `username`, `hasHydrated`.
- Al iniciar la app o entrar al login, limpia los datos del usuario.
- Al autenticarse correctamente, actualiza los datos de usuario con la respuesta del backend.

### d. Validaciones y feedback

- Muestra mensajes de error amigables si el backend responde con errores.
- Muestra feedback de "loading" mientras espera la respuesta del backend.

### e. Navegación

- Redirige al usuario a la página principal o a una página de verificación tras el login exitoso.
- Ofrece un enlace para recuperar la contraseña.

## 3. Interoperabilidad con el backend

- El esquema de envío de datos debe ser:
  - POST `/auth/login` con campos `email` y `password`.
- El esquema de respuesta debe incluir un `access_token` y los datos del usuario.
- Los errores deben reflejar los mensajes proporcionados por el backend (`Credenciales inválidas`, `Email ya registrado`, etc.).

## 4. Seguridad

- Almacena el JWT únicamente en memoria o en un almacenamiento seguro del frontend.
- Nunca lo expongas en url ni en localStorage si no es necesario.

## 5. Pruebas

- Verifica que el frontend pueda iniciar sesión con usuarios válidos registrados en el backend.
- Verifica el manejo adecuado de errores.

## 6. Extensión

- El flujo de registro puede seguir una estructura análoga, usando un esquema zod para validaciones similares (nombre, apellido, email, password).
- Factores como verificación por email, recuperación de contraseña deben contemplarse para la UI aunque inicialmente sean mock.

---

### Ejemplo de endpoints del backend a consumir:

- **POST `/auth/login`**
  - Input: `{ email, password }`
  - Output éxito: `{ access_token, ...usuario }`
  - Output error: `{ message }`

### Herramientas recomendadas del frontend por equivalencia:

- **react-hook-form + zod** (validaciones de formulario)
- **zustand** (manejo de estado de usuario)
- **@tanstack/react-query** (peticiones y mutaciones)
- **Tailwind** (opcional, estilos rápidos)

---

---

## 1. Autenticación y Sesión

### POST `/auth/login`

| Uso             | Iniciar sesión y obtener un JWT                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Body (JSON)     | `{ "email": string, "password": string }`                                                                |
| Respuesta (200) | `{ "access_token": string, "email": string, "id": number, "username": string, ...otros_campos_usuario }` |
| Errores         | 400/401: Mensajes en español. Ejemplos:                                                                  |

- "Credenciales inválidas"
- "Usuario no verificado"
- "Contraseña incorrecta"
  | Validaciones |
- Email requerido, válido
- Password requerido, mínimo 6 caracteres
- Payload limpio (no campos extra)

---

### GET `/auth/profile`

| Uso | Obtener perfil del usuario autenticado (protegido por JWT) |
| Header | `Authorization: Bearer <access_token>` |
| Respuesta (200) | Datos del usuario: `{ "id": number, "email": string, "username": string, "role": string }` |
| Errores | 401 si el token es inválido/ausente |

---

## 2. Gestión de Usuarios

### POST `/users`

| Uso | Registrar nuevo usuario |
| Body (JSON) | `{ "email": string, "password": string, "username": string, ... }` |
| Validaciones |

- Email único y válido
- Password mínimo 6 caracteres
- Otros campos: verificación interna
  | Respuesta (201) | Usuario creado `{ "id": number, "email": string, ... }` |
  | Errores | 400/409: "Email ya registrado", "Datos inválidos" |

---

### GET `/users`

| Uso | Listar todos los usuarios (no requiere login) |
| Respuesta (200) | `{ "users": [ { "id": number, "email": string, "role": string, ... }, ... ]}` |

---

### GET `/users/:id`

| Uso | Obtener detalle de usuario por ID |
| Parámetro | `id` numérico |
| Respuesta (200) | `{ "id": number, "email": string, ... }` |
| Errores | 404: "Usuario no encontrado" |

---

### PATCH `/users/:id`

| Uso | Editar usuario (email no modificable) |
| Body (JSON) | `{ "username": string, ... }` |
| Restricciones | No se modifica el email por seguridad/convenio |
| Respuesta (200) | Usuario actualizado `{ ... }` |
| Errores | 400/404: "Usuario no encontrado", "Datos inválidos" |

---

### DELETE `/users/:id`

| Uso | Eliminar usuario |
| Parámetro | `id` numérico |
| Respuesta (200) | `{ "message": "Usuario eliminado" }` |
| Errores | 404: "Usuario no encontrado" |

---

## 3. Validaciones Globales

- El backend emplea un sistema global para validar y sanear todos los payloads.
- Respuestas y errores en español, mensajes cortos.
- Whitelisting de campos y protección contra datos inesperados.

Referencias internas:  
`src/infra/validators/validation.pipe.ts`

---

## 4. Roles de Usuario

| Rol         | Permisos              |
| ----------- | --------------------- |
| ADMIN       | Control total         |
| EDITOR      | Gestiona contenido    |
| CONTRIBUTOR | Sólo puede contribuir |

Interno:  
`src/users/interfaces/user-role.enum.ts`

---

## 5. Ejemplo de flujo de autenticación

1. Usuario registra cuenta (`POST /users`)
2. Usuario inicia sesión (`POST /auth/login`) → recibe JWT
3. Frontend guarda JWT y datos del usuario
4. Para acciones que requieren sesión, envía JWT en la cabecera Authorization
5. Puede consultar perfil (`GET /auth/profile`)

---

## 6. Otros

- Todos los endpoints devuelven errores en español.
- Los datos del usuario siempre incluyen: id, email, username y role en las respuestas principales.
- Revisa el backend si necesitas campos extra de usuario (como fechas, estado verificado, etc).

---
