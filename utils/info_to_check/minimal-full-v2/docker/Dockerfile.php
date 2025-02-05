# Use PHP with FastCGI Process Manager (FPM)
FROM php:8.0-fpm

# Set the working directory inside the container
WORKDIR /var/www/html

# Copy backend files into the container
COPY ../../backend /var/www/html

# Install required PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Expose PHP-FPM port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
