FROM node:latest

# Install required dependencies
RUN apt-get update && \
    apt-get install -y \
    mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables from build arguments
ARG SMTP_USER
ARG SMTP_PASSWORD
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASSWORD=$SMTP_PASSWORD

RUN npm install -g prisma@latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./


# Install npm dependencies
RUN npm install


# Copy application code
COPY . .

# Generate Prisma client

RUN npx prisma generate

# Expose the port your app runs on
EXPOSE 8000

# Define the command to run your app

CMD ["node", "server.js", "0.0.0.0"]
