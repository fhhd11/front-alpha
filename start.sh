#!/bin/sh

echo "Starting Letta Chatbot..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "ERROR: NEXT_PUBLIC_SUPABASE_URL is not set"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_BACKEND_URL" ]; then
  echo "ERROR: NEXT_PUBLIC_BACKEND_URL is not set"
  exit 1
fi

echo "Environment variables are set correctly"
echo "Starting Next.js server..."

# Start the server
exec node server.js
