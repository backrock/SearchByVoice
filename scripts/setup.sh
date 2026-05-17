#!/bin/bash

set -e

echo "🎵 SearchByVoice Setup"
echo ""

echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    exit 1
fi
echo "✓ Node.js $(node --version)"

echo "Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    fi
fi
echo "✓ FFmpeg installed"

echo "Checking Chromaprint..."
if ! command -v fpcalc &> /dev/null; then
    echo "⚠️  Chromaprint is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install chromaprint
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y chromaprint
    fi
fi
echo "✓ Chromaprint installed"

echo ""
echo "Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✓ Backend dependencies installed"

echo ""
if [ ! -f backend/.env ]; then
    echo "Creating .env file..."
    cp .env.example backend/.env
    echo "✓ .env file created"
fi

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your AcoustID API Key"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && python3 -m http.server 8080"
echo ""
