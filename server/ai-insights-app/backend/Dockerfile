# Base image with node & bash
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything into container
COPY . .

# 🧠 Ollama setup
RUN apt-get update && apt-get install -y curl bash

# Download and install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Expose port
EXPOSE 5001

# Start Ollama in the background, then start node
CMD ollama serve & node index.js
