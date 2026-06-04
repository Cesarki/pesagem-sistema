# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from pesagem-web
COPY pesagem-web/package*.json ./

# Copy all files from pesagem-web
COPY pesagem-web/client ./client
COPY pesagem-web/server ./server
COPY pesagem-web/vite.config.ts ./
COPY pesagem-web/tsconfig.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Build the project
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]

