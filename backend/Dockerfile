# --- Builder stage ---
# Needs devDependencies (typescript, prisma CLI) to compile and generate
# the Prisma client. Nothing from this stage ships in the final image
# except the specific build artifacts we explicitly copy out below.
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (better layer caching — only re-runs npm ci when
# package*.json actually change, not on every source edit)
COPY package.json package-lock.json ./
RUN npm ci

# Prisma schema must be present before `prisma generate`, and
# `prisma generate` must run before `tsc`, since src/prisma.ts (or
# wherever the client is instantiated) imports generated types.
COPY prisma ./prisma
RUN npx prisma generate

# Now bring in the rest of the source and compile.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop devDependencies now that build artifacts exist, so the
# node_modules we copy into the final stage is production-only.
RUN npm prune --omit=dev

# --- Final stage ---
# Slim runtime image: no TypeScript, no prisma CLI, no source .ts files.
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to actually run the compiled app.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# uploads/ is referenced in server.ts via express.static
RUN mkdir -p uploads/kyc

EXPOSE 5000

# Default command — overridden per-service in docker-compose.yml
CMD ["node", "dist/server.js"]