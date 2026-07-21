#!/bin/bash
set -e
# Retry migrate deploy up to 3 times (Neon cold-start advisory lock timeouts)
for i in 1 2 3; do
  echo "Attempt $i: prisma migrate deploy..."
  if npx prisma migrate deploy; then
    echo "Migrations applied successfully."
    exit 0
  fi
  echo "Attempt $i failed. Retrying in 5s..."
  sleep 5
done
echo "All migration attempts failed."
exit 1
