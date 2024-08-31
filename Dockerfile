
# Use the official Node.js 14 image as the base image.
FROM node:alpine3.18


# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json /app

# Install any needed packages specified in package.json
RUN npm install

COPY . .



# Make port 8080 available to the world outside this container
EXPOSE 4000
EXPOSE 4040

# Run the app when the container launches
CMD ["npm", "run", "start"] 
















# # Stage 1: Build the Node.js application
# FROM node:alpine3.18 AS build

# # Set the working directory to /app
# WORKDIR /app

# # Copy package.json and package-lock.json to the container
# COPY package*.json ./

# # Install dependencies
# RUN npm install --production

# # Copy the rest of the application
# COPY . .

# # Stage 2: Serve the Node.js application with Nginx
# FROM nginx:1.23-alpine

# # Copy static files from the build stage to Nginx's web root directory
# COPY --from=build /app /usr/share/nginx/html

# # Expose port 80 to the outside world
# EXPOSE 80

# # Default command to start Nginx when the container launches
# CMD ["nginx", "-g", "daemon off;"]






