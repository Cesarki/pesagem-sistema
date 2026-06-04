# Sistema de Pesagem de Caminhões - Documentação Completa

## 📋 Visão Geral

Sistema completo de pesagem de caminhões com dois subsistemas integrados:
- **Sistema 1 (Porteiro)**: Registra entrada de caminhões com dados iniciais
- **Sistema 2 (Balanceiro)**: Finaliza pesagens com peso final e status

## 🏗️ Arquitetura do Projeto

### Frontend (React + TypeScript + Tailwind CSS)
Localizado em: `/home/ubuntu/pesagem-web/`

### Backend (PHP + PostgreSQL)
Localizado em: `/home/ubuntu/pesagem-api/`

## 🔐 Sistema de Autenticação

### Usuários de Teste

| Tipo | Email | Senha | Acesso |
|------|-------|-------|--------|
| Porteiro | porteiro@pesagem.com | 123456 | Sistema 1 apenas |
| Balanceiro | balanceiro@pesagem.com | 123456 | Sistema 2 apenas |
| Admin | admin@pesagem.com | 123456 | Ambos os sistemas |

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout

### Pesagens
- `GET /api/pesagens` - Listar todas as pesagens
- `GET /api/pesagens/{id}` - Obter detalhes de uma pesagem
- `GET /api/pesagens/pendentes` - Listar pesagens aguardando finalização
- `POST /api/pesagens` - Criar nova pesagem (Sistema 1)
- `PUT /api/pesagens/{id}` - Atualizar pesagem (Sistema 2)

### Motoristas
- `GET /api/motoristas` - Listar motoristas
- `POST /api/motoristas` - Criar motorista

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário

## 🗄️ Schema do Banco de Dados PostgreSQL

### Tabela: usuarios
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: motoristas
```sql
CREATE TABLE motoristas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(20) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: pesagens
```sql
CREATE TABLE pesagens (
  id SERIAL PRIMARY KEY,
  motorista_id INTEGER NOT NULL REFERENCES motoristas(id),
  placa_caminhao VARCHAR(20) NOT NULL,
  data_pesagem DATE NOT NULL,
  hora_entrada TIME NOT NULL,
  hora_saida TIME,
  pesagem_inicial DECIMAL(10, 2) NOT NULL,
  pesagem_final DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deploy no Render.com

### Pré-requisitos
- Conta no Render.com
- Repositório GitHub com o código

### Passos para Deploy

1. **Criar Banco de Dados PostgreSQL**
   - Acesse https://render.com → New → PostgreSQL
   - Copie a connection string

2. **Criar Web Service para Frontend**
   - New → Web Service
   - Conecte seu repositório GitHub
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

3. **Criar Web Service para Backend**
   - New → Web Service
   - Conecte seu repositório GitHub
   - Build Command: `composer install`
   - Start Command: `php -S 0.0.0.0:8000 -t public`

4. **Configurar Variáveis de Ambiente**
   - DATABASE_URL
   - JWT_SECRET

## 📱 Fluxo de Uso

### Sistema 1 (Porteiro)
1. Faz login
2. Preenche formulário de entrada
3. Seleciona motorista, placa, data, hora e peso inicial
4. Clica em "Registrar Entrada"

### Sistema 2 (Balanceiro)
1. Faz login
2. Vê lista de pesagens pendentes
3. Clica em uma pesagem
4. Preenche peso final e status
5. Clica em "Finalizar"

## 🔧 Configurações Importantes

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pesagem_db
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta_super_segura
PORT=8000
```

## 📝 Tecnologias Utilizadas

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- Wouter (roteamento)
- shadcn/ui (componentes)
- Axios (requisições HTTP)
- Sonner (notificações)

### Backend
- PHP 8+
- PostgreSQL
- JWT (autenticação)
- Composer (gerenciador de pacotes)

### DevOps
- Render.com (hosting)
- GitHub (versionamento)

## 🎯 Próximas Melhorias

1. Relatórios em PDF
2. Notificações em Tempo Real
3. Histórico de Pesagens
4. Gráficos e Estatísticas
5. Backup Automático

## 📄 Arquivos Importantes

- `/home/ubuntu/pesagem-web/` - Projeto frontend
- `/home/ubuntu/pesagem-api/` - Projeto backend
- `/home/ubuntu/pesagem-api.zip` - Backup do código PHP
