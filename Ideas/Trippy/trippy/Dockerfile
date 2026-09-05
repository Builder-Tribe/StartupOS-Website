# Trippy — single container: builds both frontends and runs the Express server.
# The server serves website/dist at "/", web/dist at "/app", and the API at "/api"
# on one port. It uses your existing external Postgres via DATABASE_URL
# (and falls back to embedded SQLite if DATABASE_URL is unset).
FROM node:22-slim

WORKDIR /app

# Pin yarn v1 to match the repo's lockfile (yarn lockfile v1).
RUN npm install -g yarn@1.22.22 --force

# Install all workspace deps first so this layer is cached unless a manifest
# changes. Dev deps are required to BUILD the frontends (vite, typescript) and
# to RUN the server (tsx), so we do a full install (no --production).
COPY package.json yarn.lock ./
COPY server/package.json ./server/package.json
COPY web/package.json ./web/package.json
COPY website/package.json ./website/package.json
RUN yarn install --frozen-lockfile

# Copy the rest of the source and build both frontends into their dist folders.
COPY . .
RUN yarn workspace web build && yarn workspace website build

# Cloud Run (and most hosts) inject PORT; the server reads process.env.PORT.
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Starts `tsx src/index.ts`, which serves the built frontends + /api on $PORT.
CMD ["yarn", "workspace", "server", "start"]
