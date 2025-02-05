#!/bin/bash

# Project Structure Generation Script
# Run this script in your terminal to create the necessary files and folders

mkdir -p ft_transcendence/{backend/{public,src,config},frontend/{src/components,public},docker}

# Backend files
touch ft_transcendence/backend/public/{index.php,.htaccess}
touch ft_transcendence/backend/src/{Router.php,Database.php,Auth.php,Game.php}
touch ft_transcendence/backend/config/config.php
touch ft_transcendence/backend/.env
touch ft_transcendence/backend/composer.json

# Frontend files
touch ft_transcendence/frontend/src/{index.ts,router.ts}
touch ft_transcendence/frontend/src/components/{Pong.ts,UI.ts}
touch ft_transcendence/frontend/public/index.html
touch ft_transcendence/frontend/package.json
touch ft_transcendence/frontend/tsconfig.json
touch ft_transcendence/frontend/vite.config.ts

# Docker files
touch ft_transcendence/docker/{Dockerfile.backend,Dockerfile.frontend}
touch ft_transcendence/docker-compose.yml

# Project-level files
touch ft_transcendence/.gitignore
touch ft_transcendence/README.md

echo "✅ Project structure created successfully!"
