# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
# URL-ul API-ului, vazut din browser (nu din container)
ARG VITE_API_URL=http://localhost:5000
ARG REACT_APP_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build
# Vite produce /dist, Create React App produce /build
RUN mkdir -p /out && (cp -r dist/. /out/ 2>/dev/null || cp -r build/. /out/)

# ---- serve ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /out /usr/share/nginx/html
EXPOSE 80
