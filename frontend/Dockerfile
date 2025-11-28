FROM node:18-bullseye

WORKDIR /app

# install deps
COPY package.json package-lock.json* /app/
RUN npm ci --silent || npm install --silent

# copy project files
COPY . /app

EXPOSE 5173

# Run vite dev server and bind to 0.0.0.0 so it's reachable from host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
