FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .
EXPOSE 3000
CMD ["npx", "tsx", "watch", "app.ts"]