/**
 * @fileoverview
 * SvelteKit Auth.js configuration using Prisma (for users & tokens)
 * and JWT (for stateless sessions), with passwordless magic link
 * login through Nodemailer (SMTP).
 */

import { SvelteKitAuth } from "@auth/sveltekit"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "@auth/sveltekit/providers/nodemailer"
import { prisma } from "$lib/prisma"
import fs from 'fs';
import path from 'path';
import { NODE_ENV, AUTH_EMAIL_SERVER_HOST, AUTH_EMAIL_SERVER_PORT, AUTH_EMAIL_SERVER_USER, AUTH_EMAIL_SERVER_PASSWORD, AUTH_EMAIL_FROM } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    EmailProvider({
      id: "email",
      server: {
        host: AUTH_EMAIL_SERVER_HOST,
        port: Number(AUTH_EMAIL_SERVER_PORT),
        auth: {
          user: AUTH_EMAIL_SERVER_USER,
          pass: AUTH_EMAIL_SERVER_PASSWORD,
        },
      },
      from: AUTH_EMAIL_FROM,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 15,
  },

  // Optional: add fields from the user model into JWT
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        // Check admin CSV on first login
        try {
          const adminCsv = path.join(process.cwd(), 'static', 'admin.csv');
          if (fs.existsSync(adminCsv)) {
            const adminEmails = fs
            .readFileSync(adminCsv, 'utf-8')
            .split('\n')
            .map(e => e.trim())
            .filter(Boolean);
            if (adminEmails.includes(user.email)) {
              token.role = 'admin';
            }
          }
        } catch (err) {
          console.error('Error reading admin.csv:', err);
        }
      }
      return token
    },
    async session({ session, token }) {
      const now = Math.floor(Date.now() / 1000);
      if (token?.exp && token.exp < now) {
        // Token expired, destroy session
        return null;
      }
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.role = token.role ?? 'user';
      }
      return session
    },
  },

  pages: {
    signIn: "/auth",
  },

  debug: NODE_ENV === "development",
})
