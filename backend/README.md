USER

# Backend CMS – S11 (NestJS + TypeORM + Auth + Roles)

Proyecto backend desarrollado con **NestJS 11**, **TypeORM**, **JWT**, **Passport**, **validaciones globales**, gestión de usuarios y autenticación.

Este documento resume la estructura del proyecto, rutas implementadas y las decisiones técnicas clave para que otros desarrolladores continúen el trabajo sin perder contexto.


# 1. Estructura del Backend
src/
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt/
│   │   ├── jwt.strategy.ts
│   │   └── jwt.guard.ts
│   ├── dto/
│   │   └── login.dto.ts
│   └── types/
│       └── auth-payload.type.ts
│
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── interfaces/
│       └── user-role.enum.ts
│
├── infra/
│   └── validators/
│       └── validation.pipe.ts  (GlobalValidationPipe)
│
└── main.ts

# 2. Rutas implementadas
👤 Usuarios (NO requiere login)
Método	        Ruta	                Descripción
POST	        /users	                Registrar usuario (se decidió por convención REST)
GET	            /users	                Listar usuarios
GET	            /users/:id	            Obtener usuario
PATCH	        /users/:id	            Actualizar (email NO se puede modificar)
DELETE	        /users/:id	            Eliminar usuario

# 3. Autenticación con JWT
Método	        Ruta	                Descripción
POST	           /auth/login	        Iniciar sesión y obtener JWT
GET	                /auth/profile	    Obtener perfil del usuario autenticado

# 4. Validaciones
* Validación global personalizada

Ruta:

``` src/infra/validators/validation.pipe.ts ```

Motivo:
- Mantener mensajes en español.
- Mensajes limpios y cortos.
- Evitar inputs inesperados (whitelist).
- Prevenir ataques por payloads manipulados.

# 5. Roles de usuario

Archivo:
``` src/users/interfaces/user-role.enum.ts ```

Roles actuales:

ADMIN
EDITOR
CONTRIBUTOR

# 6. JWT Strategy

Archivo:
``` src/auth/jwt/jwt.strategy.ts ```

Uso:

- Extraer JWT del header.
- Validar firma.
- Adjuntar el payload al request.
- Proteger rutas con @UseGuards(JwtAuthGuard).
- Se mantiene simple para evitar sobrecarga innecesaria.

