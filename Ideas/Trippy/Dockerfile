# Trippy — Google Cloud Run container build
FROM node:22-slim

WORKDIR /app

RUN npm install -g yarn@1.22.22 --force

# Copy workspace files from trippy folder
COPY trippy/package.json trippy/yarn.lock ./
COPY trippy/server/package.json ./server/package.json
COPY trippy/web/package.json ./web/package.json
COPY trippy/website/package.json ./website/package.json

RUN yarn install --frozen-lockfile

COPY trippy/ ./

RUN yarn workspace web build && yarn workspace website build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["yarn", "workspace", "server", "start"]
