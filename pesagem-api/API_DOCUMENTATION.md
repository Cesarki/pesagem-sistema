# Documentação da API REST - Sistema de Pesagem de Caminhões

## Visão Geral

Esta é uma **API REST** desenvolvida em **PHP** com **PostgreSQL** para gerenciar o sistema de pesagem de caminhões. A API segue o padrão **MVC** e utiliza autenticação **JWT** para segurança.

## Características Principais

- ✅ Autenticação JWT segura
- ✅ Controle de acesso baseado em roles (admin/operador)
- ✅ Arquitetura MVC robusta
- ✅ Banco de dados PostgreSQL
- ✅ Endpoints RESTful bem documentados
- ✅ Tratamento de erros padronizado
- ✅ CORS habilitado para integração com Sistema 2

## Estrutura do Projeto

```
pesagem-api/
├── src/
│   ├── Models/              # Modelos de dados
│   │   ├── Model.php        # Classe base
│   │   ├── Usuario.php      # Modelo de usuários
│   │   ├── Motorista.php    # Modelo de motoristas
│   │   └── Pesagem.php      # Modelo de pesagens
│   ├── Controllers/         # Controladores
│   │   ├── AuthController.php
│   │   ├── UsuarioController.php
│   │   ├── MotoristaController.php
│   │   └── PesagemController.php
│   ├── Middleware/          # Middleware de autenticação
│   │   └── AuthMiddleware.php
│   ├── JWT.php              # Classe de geração/validação JWT
│   └── Response.php         # Classe para respostas padronizadas
├── public/
│   └── index.php            # Ponto de entrada da API
├── config/
│   └── database.php         # Configuração do banco de dados
├── database/
│   ├── schema.sql           # Schema do banco de dados
│   └── init.sh              # Script de inicialização
├── .env                     # Variáveis de ambiente
├── .env.example             # Exemplo de variáveis
├── composer.json            # Dependências do projeto
└── README.md                # Este arquivo
```

## Instalação e Configuração

### Pré-requisitos

- PHP 7.4+
- PostgreSQL 12+
- Composer (opcional, para gerenciar dependências)

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd pesagem-api
   ```

2. **Configure o arquivo .env**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas credenciais de banco de dados
   ```

3. **Inicialize o banco de dados**
   ```bash
   bash database/init.sh
   ```

4. **Inicie o servidor (desenvolvimento)**
   ```bash
   php -S localhost:8000 -t public
   ```

5. **Teste a API**
   ```bash
   curl http://localhost:8000/api/status
   ```

## Autenticação

A API utiliza **JWT (JSON Web Token)** para autenticação. Todos os endpoints (exceto `/api/auth/login`) requerem um token válido.

### Fluxo de Autenticação

1. **Fazer login** com email e senha
2. **Receber token JWT**
3. **Enviar token** no header `Authorization: Bearer <token>`
4. **Token expira em 24 horas**

### Exemplo de Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pesagem.com",
    "senha": "123456"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "usuario": {
      "id": 1,
      "nome": "Admin Sistema",
      "email": "admin@pesagem.com",
      "role": "admin"
    }
  }
}
```

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/auth/login` | Fazer login | Não |
| POST | `/api/auth/logout` | Fazer logout | Sim |
| GET | `/api/auth/verificar` | Verificar token | Sim |

### Pesagens

| Método | Endpoint | Descrição | Autenticação | Role |
|--------|----------|-----------|--------------|------|
| POST | `/api/pesagens` | Criar nova pesagem | Sim | Operador+ |
| GET | `/api/pesagens` | Listar todas as pesagens | Sim | Operador+ |
| GET | `/api/pesagens/{id}` | Obter pesagem por ID | Sim | Operador+ |
| PUT | `/api/pesagens/{id}` | Atualizar pesagem | Sim | Operador+ |
| DELETE | `/api/pesagens/{id}` | Deletar pesagem | Sim | Admin |
| GET | `/api/pesagens/pendentes` | Listar pesagens pendentes | Sim | Operador+ |
| GET | `/api/pesagens/motorista?motorista_id=X` | Listar pesagens de um motorista | Sim | Operador+ |

### Motoristas

| Método | Endpoint | Descrição | Autenticação | Role |
|--------|----------|-----------|--------------|------|
| POST | `/api/motoristas` | Criar motorista | Sim | Operador+ |
| GET | `/api/motoristas` | Listar motoristas | Sim | Operador+ |
| GET | `/api/motoristas/{id}` | Obter motorista por ID | Sim | Operador+ |
| PUT | `/api/motoristas/{id}` | Atualizar motorista | Sim | Operador+ |
| DELETE | `/api/motoristas/{id}` | Deletar motorista | Sim | Admin |

### Usuários (Admin)

| Método | Endpoint | Descrição | Autenticação | Role |
|--------|----------|-----------|--------------|------|
| POST | `/api/usuarios` | Criar usuário | Sim | Admin |
| GET | `/api/usuarios` | Listar usuários | Sim | Admin |
| GET | `/api/usuarios/{id}` | Obter usuário por ID | Sim | Operador+ |
| PUT | `/api/usuarios/{id}` | Atualizar usuário | Sim | Admin ou Próprio |
| DELETE | `/api/usuarios/{id}` | Deletar usuário | Sim | Admin |

### Status

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/status` | Verificar saúde da API | Não |

## Exemplos de Uso

### 1. Criar uma Nova Pesagem (Sistema 1)

```bash
curl -X POST http://localhost:8000/api/pesagens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{
    "motorista_id": 1,
    "placa_caminhao": "ABC-1234",
    "data_pesagem": "2026-05-21",
    "hora_entrada": "08:30:00",
    "pesagem_inicial": 5000.50
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pesagem criada com sucesso",
  "data": {
    "id": 1,
    "motorista_id": 1,
    "placa_caminhao": "ABC-1234",
    "data_pesagem": "2026-05-21",
    "hora_entrada": "08:30:00",
    "hora_saida": null,
    "pesagem_inicial": 5000.50,
    "pesagem_final": null,
    "status": "Pesando",
    "criado_em": "2026-05-21 08:30:00",
    "atualizado_em": "2026-05-21 08:30:00"
  }
}
```

### 2. Listar Pesagens Pendentes (Sistema 2)

```bash
curl -X GET http://localhost:8000/api/pesagens/pendentes \
  -H "Authorization: Bearer <seu-token>"
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pesagens pendentes listadas com sucesso",
  "data": [
    {
      "id": 1,
      "motorista_id": 1,
      "placa_caminhao": "ABC-1234",
      "data_pesagem": "2026-05-21",
      "hora_entrada": "08:30:00",
      "pesagem_inicial": 5000.50,
      "status": "Pesando",
      "criado_em": "2026-05-21 08:30:00"
    }
  ]
}
```

### 3. Finalizar Pesagem (Sistema 2)

```bash
curl -X PUT http://localhost:8000/api/pesagens/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{
    "pesagem_final": 4200.50,
    "status": "Pesagem finalizada"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pesagem atualizada com sucesso",
  "data": {
    "id": 1,
    "motorista_id": 1,
    "placa_caminhao": "ABC-1234",
    "data_pesagem": "2026-05-21",
    "hora_entrada": "08:30:00",
    "hora_saida": "15:00:00",
    "pesagem_inicial": 5000.50,
    "pesagem_final": 4200.50,
    "status": "Pesagem finalizada",
    "criado_em": "2026-05-21 08:30:00",
    "atualizado_em": "2026-05-21 15:00:00"
  }
}
```

### 4. Criar Motorista

```bash
curl -X POST http://localhost:8000/api/motoristas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{
    "nome": "João Silva",
    "documento": "12345678901",
    "telefone": "11987654321"
  }'
```

## Formato de Resposta

Todas as respostas seguem um padrão consistente:

### Sucesso (2xx)
```json
{
  "success": true,
  "message": "Descrição da ação realizada",
  "data": { /* dados retornados */ }
}
```

### Erro (4xx, 5xx)
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": null
}
```

## Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Requisição inválida |
| 401 | Unauthorized - Token ausente ou inválido |
| 403 | Forbidden - Acesso negado (permissão insuficiente) |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email duplicado) |
| 500 | Internal Server Error - Erro no servidor |

## Roles e Permissões

| Role | Permissões |
|------|-----------|
| **admin** | Acesso total a todos os endpoints |
| **operador** | Criar/listar pesagens e motoristas, atualizar próprios dados |

## Dados de Exemplo

O banco de dados é inicializado com dados de exemplo:

**Usuário Admin:**
- Email: `admin@pesagem.com`
- Senha: `123456`
- Role: `admin`

**Usuários Operadores:**
- Email: `operador1@pesagem.com`
- Email: `operador2@pesagem.com`
- Senha: `123456`
- Role: `operador`

**Motoristas:**
- João Silva (CPF: 12345678901)
- Maria Santos (CPF: 98765432101)
- Pedro Oliveira (CPF: 55555555555)
- Ana Costa (CPF: 44444444444)
- Carlos Ferreira (CPF: 33333333333)

## Deploy no Render.com

### Pré-requisitos
- Conta no Render.com
- Repositório GitHub com o código

### Passos

1. **Faça push do código para GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Acesse Render.com e crie um novo serviço**
   - Conecte seu repositório GitHub
   - Selecione "Web Service"
   - Configure as variáveis de ambiente

3. **Render criará automaticamente:**
   - Serviço web PHP
   - Banco de dados PostgreSQL
   - SSL/TLS certificado

4. **Seu API estará disponível em:**
   ```
   https://seu-app-name.onrender.com/api/status
   ```

## Troubleshooting

### Erro: "Conexão recusada ao banco de dados"
- Verifique se PostgreSQL está rodando
- Verifique as credenciais em `.env`
- Verifique se o banco de dados foi criado

### Erro: "Token inválido"
- Verifique se o token foi incluído no header
- Verifique se o token não expirou (24 horas)
- Verifique o formato: `Authorization: Bearer <token>`

### Erro: "Acesso negado"
- Verifique se o usuário tem a role correta
- Verifique se o token é válido

## Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor ou abra uma issue no repositório GitHub.

---

**Versão:** 1.0.0  
**Última atualização:** 21 de maio de 2026  
**Desenvolvido para:** Projeto Integrador - Faculdade
