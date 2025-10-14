#!/bin/bash
set -e

npx prisma migrate deploy
npx prisma generate

npm run dev -- --host
