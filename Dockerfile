FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG AIRTABLE_API_KEY
ARG AIRTABLE_BASE_ID
ARG AIRTABLE_TABLE_NAME
ARG CLUB_API_KEY
ARG DATABASE_URL
ARG HACKCLUB_AUTH_CLIENT_ID
ARG HACKCLUB_AUTH_CLIENT_SECRET
ARG HACKCLUB_AUTH_REDIRECT_URI
ARG SESSION_SECRET
ARG TOKEN_ENC_KEY

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/build ./build
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/knexfile.js ./knexfile.js

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "npx knex migrate:latest && node build"]
