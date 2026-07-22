#!/bin/bash
set -e

# Warm up Neon connection before migration (free tier cold-starts can be slow)
echo "Warming up database connection..."
npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null || true
sleep 2

# Retry migrate deploy up to 5 times (Neon cold-start advisory lock timeouts)
for i in 1 2 3 4 5; do
  echo "Attempt $i: prisma migrate deploy..."
  if npx prisma migrate deploy; then
    echo "Migrations applied successfully."
    exit 0
  fi
  echo "Attempt $i failed. Retrying in $((i * 3))s..."
  sleep $((i * 3))
done
echo "All migration attempts failed."
exit 1
