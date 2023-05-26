# Establecer la imagen base
FROM node:14

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Exponer el puerto en el que el servidor del backend escucha
EXPOSE 3000

# Comando para ejecutar el servidor del backend
CMD ["npm", "start"]
