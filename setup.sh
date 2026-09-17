#!/bin/bash

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << 'EOF'
SECRET_KEY=change-me-in-production
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

DB_NAME=yara_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
EOF
    echo "✓ backend/.env created"
else
    echo "✓ backend/.env already exists"
fi

echo ""
echo "Setup complete! You can now run:"
echo "  cd backend && python manage.py runserver"
echo "  cd frontend && npm run dev"