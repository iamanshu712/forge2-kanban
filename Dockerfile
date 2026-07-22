FROM php:8.2-cli-alpine

# Install SQLite and required system dependencies
RUN apk add --no-cache \
    sqlite-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    oniguruma-dev \
    libpng-dev

RUN docker-php-ext-install pdo pdo_sqlite mbstring zip gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy backend application
COPY backend/ .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create SQLite database file and fix permissions
RUN mkdir -p database storage/framework/views storage/framework/sessions storage/framework/cache storage/logs \
    && touch database/database.sqlite \
    && chmod -R 777 storage database

# Entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
