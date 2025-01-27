# Dockerfile pour Next.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Exposer le port 3000 pour Next.js
EXPOSE 3000

# Lancer le serveur Next.js
CMD ["npm", "run", "dev"]