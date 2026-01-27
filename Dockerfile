# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine as backend-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine
WORKDIR /app

# Copy backend artifacts
COPY --from=backend-build /app/server/dist ./dist
COPY --from=backend-build /app/server/package*.json ./
COPY --from=backend-build /app/server/prisma ./prisma

# Copy frontend artifacts
COPY --from=frontend-build /app/dist ./public

# Install production dependencies
RUN npm install --production
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/index.js"]
