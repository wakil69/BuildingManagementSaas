# Use a lightweight HTTP server for static files
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the app's source code
COPY . .

# Build the Vite app
RUN npm run build

# Install a lightweight static file server (e.g., serve)
RUN npm install -g serve

# Expose the port for the static file server
EXPOSE 3000

# Command to serve the built files
CMD ["serve", "-s", "dist", "-l", "3000"]
