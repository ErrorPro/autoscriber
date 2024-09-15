# Use Node.js LTS version as the base image
FROM node:lts-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Start a new stage for a smaller production image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Expose the port the app will run on
EXPOSE 3000

# Set environment variable to run in production mode
ENV NODE_ENV production

# Start the application
CMD ["npm", "start"]