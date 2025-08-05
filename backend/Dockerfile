# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Copy the rest of the backend code into the container
COPY . .

# Compile TypeScript to JavaScript (optional for better performance)
RUN npx tsc

# Expose the port that the Express server will run on
EXPOSE 8080

# Command to start the server with PM2
CMD ["pm2-runtime", "dist/app.js"]
