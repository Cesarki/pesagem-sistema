#!/bin/bash

# Script para inicializar o banco de dados PostgreSQL

# Variáveis de ambiente
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-pesagem_db}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo "=========================================="
echo "Inicializando banco de dados PostgreSQL"
echo "=========================================="
echo "Host: $DB_HOST"
echo "Porta: $DB_PORT"
echo "Banco: $DB_NAME"
echo "Usuário: $DB_USER"
echo ""

# Exportar senha para não precisar digitar
export PGPASSWORD=$DB_PASSWORD

# Criar banco de dados se não existir
echo "1. Criando banco de dados..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

if [ $? -eq 0 ]; then
    echo "   ✓ Banco de dados pronto"
else
    echo "   ✗ Erro ao criar banco de dados"
    exit 1
fi

# Executar schema
echo "2. Executando schema SQL..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/schema.sql"

if [ $? -eq 0 ]; then
    echo "   ✓ Schema criado com sucesso"
else
    echo "   ✗ Erro ao executar schema"
    exit 1
fi

echo ""
echo "=========================================="
echo "Banco de dados inicializado com sucesso!"
echo "=========================================="
echo ""
echo "Credenciais de acesso:"
echo "  Email (Admin): admin@pesagem.com"
echo "  Senha: 123456"
echo ""
