# Etapa 1: Build (Compilación)
FROM node:20-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package*.json ./

# Instala las dependencias de producción y de desarrollo
RUN npm install

# Copia todo el código fuente del backend
COPY . .

# Compila la aplicación NestJS
RUN npm run build


# Etapa 2: Runtime (Ejecución)
# Utilizamos una imagen base más ligera (solo para ejecutar)
FROM node:20-alpine AS production

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia solo las dependencias de producción
COPY --from=build /app/node_modules ./node_modules

# Copia el código compilado (la carpeta dist)
COPY --from=build /app/dist ./dist

# Expone el puerto en el que corre tu aplicación NestJS (ajusta si es diferente a 3000)
EXPOSE 3000

# Comando para ejecutar la aplicación NestJS
# Nota: El comando debe apuntar a la carpeta dist/main.js después de la compilación
CMD ["node", "dist/main.js"]