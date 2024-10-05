# Use an official Node.js image as the base
FROM node:18-alpine

# Install common development dependencies
RUN apk update && apk add --no-cache \
  git \
  bash \
  curl \
  build-base \
  openssh-client \
  libffi-dev \
  libc-dev \
  make \
  gcc \
  g++ \
  python3 \
  py3-pip \
  && rm -rf /var/cache/apk/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the port on which the app runs (assuming 3000)
EXPOSE 3000