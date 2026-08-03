# Use an official Ubuntu base image
FROM ubuntu:22.04

# Avoid prompts during apt installations
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, Java, Python, and GCC
RUN apt-get update && \
    apt-get install -y curl gnupg2 software-properties-common && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get install -y default-jdk python3 python3-pip gcc g++ make && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy the rest of the application code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build the frontend
RUN cd frontend && npm run build

# Setup the backend to run
WORKDIR /app/backend

# Use a persistent data directory for SQLite if mounted
ENV DB_PATH=/data/sqlite.db

# Ensure the /data directory exists (for fallback if not mounted)
RUN mkdir -p /data

# Expose the backend port
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
