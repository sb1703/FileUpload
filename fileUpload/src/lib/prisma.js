/**
 * @fileoverview
 * Provides a singleton instance of the PrismaClient to prevent multiple
 * instances being created during development (due to hot reloading in SvelteKit).
 * 
 * This ensures only one Prisma connection pool is used throughout the app,
 * improving performance and avoiding connection limit issues.
 */

import { PrismaClient } from "@prisma/client"
import { NODE_ENV } from '$env/static/private';

/**
 * Extends the global object to optionally include a PrismaClient instance.
 * This allows sharing a single Prisma instance across hot-reloads in development.
 * 
 * @type {globalThis & { prisma?: PrismaClient }}
 */
const globalForPrisma = globalThis

/**
 * Singleton PrismaClient instance.
 * 
 * - In production: Always creates a new instance (as there’s no hot reloading).
 * - In development: Reuses the existing instance from the global scope.
 * 
 * @type {PrismaClient}
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // Enable optional logging for debugging
  })

/**
 * During development, store the Prisma instance globally to avoid
 * creating multiple instances when the app reloads.
 */
if (NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
