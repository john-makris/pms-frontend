# Stage 1: Build Angular app
FROM arm64v8/node:14 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build --prod

# Stage 2: Serve with Nginx
FROM arm64v8/nginx:alpine

COPY --from=build /app/dist/pms-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

