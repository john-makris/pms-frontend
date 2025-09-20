# Stage 1: Build Angular app
<<<<<<< HEAD

FROM arm64v8/node:14 AS build
=======
FROM node:14 AS build
>>>>>>> 264a69f ([UPDATE] Global url prexix, nginx, docker)

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

<<<<<<< HEAD
RUN npm run build --prod

# Stage 2: Serve with Nginx
FROM arm64v8/nginx:alpine

=======
# Build for production
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Remove default nginx index
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build output
>>>>>>> 264a69f ([UPDATE] Global url prexix, nginx, docker)
COPY --from=build /app/dist/pms-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

<<<<<<< HEAD
=======
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
>>>>>>> 264a69f ([UPDATE] Global url prexix, nginx, docker)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
