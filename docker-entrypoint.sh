#!/bin/sh
set -e

# Run database migrations & seed demo data
php artisan migrate --force --seed

# Start Laravel backend on the port assigned by Render (defaults to 8080)
PORT="${PORT:-8080}"
echo "Starting Laravel backend server on 0.0.0.0:${PORT}..."
exec php -S 0.0.0.0:"${PORT}" -t public
