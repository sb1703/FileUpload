/**
 * @fileoverview
 * SvelteKit Auth.js configuration using Prisma (for users & tokens)
 * and JWT (for stateless sessions), with passwordless magic link
 * login through Nodemailer (SMTP).
 */

import { SvelteKitAuth } from "@auth/sveltekit"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "@auth/sveltekit/providers/nodemailer"
import Credentials from "@auth/sveltekit/providers/credentials"
import { prisma } from "$lib/prisma"
import fs from 'fs';
import path from 'path';
import { NODE_ENV, DEV_AUTO_AUTH_EMAIL, AUTH_EMAIL_SERVER_HOST, AUTH_EMAIL_SERVER_PORT, AUTH_EMAIL_SERVER_USER, AUTH_EMAIL_SERVER_PASSWORD, AUTH_EMAIL_FROM } from '$env/static/private';

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
    Credentials({
      id: "credentials",
      name: "Dev Auto Login",
      credentials: { email: {} },
      async authorize(credentials) {
        if (credentials?.email !== DEV_AUTO_AUTH_EMAIL) return null
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              emailVerified: new Date(),
              role: 'admin',
            },
          })
        } else if (user.role !== 'admin') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
          })
        }
        return user
      },
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
        token.role = user.role ?? 'user'
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
