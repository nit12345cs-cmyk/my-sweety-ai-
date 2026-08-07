FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Start command
CMD ["npm", "start"]
