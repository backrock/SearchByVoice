#!/bin/bash

set -e

echo "🎵 Starting SearchByVoice Application"
echo ""

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed."
    exit 1
fi

if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your AcoustID API Key"
fi

echo "📦 Starting containers..."
docker-compose up -d

echo ""
echo "✅ Application started successfully!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:3001"
echo "💚 Health:   http://localhost:3001/health"
echo ""
