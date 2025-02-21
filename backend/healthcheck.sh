#!/bin/sh
# echo "🔍 Running health check..."
# if curl -f http://localhost:3000 > /dev/null 2>&1; then
#   echo "✅ Backend is healthy!"
#   exit 0
# else
#   echo "❌ Backend health check failed!"
#   exit 1
# fi

echo "Running health check..."
curl -f http://localhost:3000 || exit 1
