#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  Smart Medicine - Linux/macOS Setup"
echo "============================================"
echo ""

echo "[1/5] Installing server dependencies..."
cd "$SCRIPT_DIR/server"
npm i
echo ""

echo "[2/5] Installing client dependencies..."
cd "$SCRIPT_DIR/client"
npm i
echo ""

echo "[3/5] Running database migration..."
cd "$SCRIPT_DIR/server"
npm run db:migrate
echo ""

echo "[4/5] Opening Prisma Studio in background..."
cd "$SCRIPT_DIR/server"
npm run db:studio &
STUDIO_PID=$!
echo "  Prisma Studio PID: $STUDIO_PID"
echo "  To stop it later: kill $STUDIO_PID"
sleep 3
echo ""

echo "[5/5] Running database seed..."
cd "$SCRIPT_DIR/server"
npm run db:seed
echo ""

echo "============================================"
echo "  Setup complete!"
echo "  Prisma Studio is running at http://localhost:5555"
echo "  Stop it with: kill $STUDIO_PID"
echo "============================================"
