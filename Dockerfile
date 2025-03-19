# Usa un'immagine ufficiale di Node.js
FROM node:18-alpine

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package.json package-lock.json* ./

# Installa le dipendenze
RUN npm install --omit=dev

# Copia il resto del codice nel container
COPY . .

# Genera Prisma Client
RUN npx prisma generate

# Espone la porta su cui gira il server
EXPOSE 8800

# Comando per avviare l'applicazione
CMD ["node", "app.js"]
