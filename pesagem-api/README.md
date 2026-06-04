# Sistema de Pesagem de Caminhões - API REST

Um sistema completo de API REST para gerenciar pesagens de caminhões em transportadoras, desenvolvido com **PHP**, **PostgreSQL** e arquitetura **MVC**.

## 🎯 Objetivo

Este projeto foi desenvolvido como **Projeto Integrador** para demonstrar a integração entre dois sistemas:

- **Sistema 1**: Registra entrada do caminhão (Nome do motorista, documento, telefone, placa, data, hora de entrada, pesagem inicial)
- **Sistema 2**: Completa o registro (Pesagem final, status da pesagem, hora de saída)

Ambos os sistemas se comunicam via **API REST** com autenticação **JWT**.

## ✨ Características

- ✅ **Autenticação JWT** segura
- ✅ **Controle de acesso** baseado em roles (admin/operador)
- ✅ **Arquitetura MVC** bem estruturada
- ✅ **PostgreSQL** como banco de dados
- ✅ **API RESTful** com 12+ endpoints
- ✅ **CORS** habilitado para integração
- ✅ **Tratamento de erros** padronizado
- ✅ **Pronto para deploy** no Render.com (gratuito)

## 🚀 Quick Start

### 1. Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd pesagem-api

# Configure o arquivo .env
cp .env.example .env

# Inicialize o banco de dados
bash database/init.sh

# Inicie o servidor
php -S localhost:8000 -t public
```

### 2. Teste a API

```bash
# Verifique o status
curl http://localhost:8000/api/status

# Faça login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pesagem.com",
    "senha": "123456"
  }'
```

## 📋 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/verificar` - Verificar token

### Pesagens
- `POST /api/pesagens` - Criar pesagem (Sistema 1)
- `GET /api/pesagens` - Listar pesagens
- `GET /api/pesagens/pendentes` - Listar pendentes (Sistema 2)
- `PUT /api/pesagens/{id}` - Atualizar pesagem (Sistema 2)
- `DELETE /api/pesagens/{id}` - Deletar pesagem

### Motoristas
- `POST /api/motoristas` - Criar motorista
- `GET /api/motoristas` - Listar motoristas
- `PUT /api/motoristas/{id}` - Atualizar motorista
- `DELETE /api/motoristas/{id}` - Deletar motorista

### Usuários
- `POST /api/usuarios` - Criar usuário (admin)
- `GET /api/usuarios` - Listar usuários (admin)
- `PUT /api/usuarios/{id}` - Atualizar usuário
- `DELETE /api/usuarios/{id}` - Deletar usuário (admin)

## 🗄️ Estrutura do Banco de Dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Usuários do sistema com autenticação |
| `motoristas` | Cadastro de motoristas |
| `pesagens` | Registro de pesagens de caminhões |

### Views

| View | Descrição |
|------|-----------|
| `v_pesagens_completas` | Pesagens com dados do motorista |
| `v_pesagens_pendentes` | Pesagens não finalizadas |

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)** para autenticação:

1. Fazer login com email e senha
2. Receber um token JWT válido por 24 horas
3. Enviar token no header: `Authorization: Bearer <token>`

### Credenciais de Teste

**Admin:**
- Email: `admin@pesagem.com`
- Senha: `123456`

**Operador:**
- Email: `operador1@pesagem.com`
- Senha: `123456`

## 📁 Estrutura do Projeto

```
pesagem-api/
├── src/
│   ├── Models/              # Modelos de dados
│   ├── Controllers/         # Controladores
│   ├── Middleware/          # Middleware de autenticação
│   ├── JWT.php              # Geração/validação JWT
│   └── Response.php         # Respostas padronizadas
├── public/
│   └── index.php            # Ponto de entrada
├── config/
│   └── database.php         # Configuração do BD
├── database/
│   ├── schema.sql           # Schema do BD
│   └── init.sh              # Script de inicialização
├── .env                     # Variáveis de ambiente
├── composer.json            # Dependências
└── README.md                # Este arquivo
```

## 🛠️ Tecnologias

- **PHP 7.4+**
- **PostgreSQL 12+**
- **JWT** para autenticação
- **PDO** para acesso ao banco de dados
- **Composer** para gerenciamento de dependências

## 📚 Documentação

Para documentação detalhada de todos os endpoints, veja [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 🌐 Deploy no Render.com

O projeto está pronto para deploy gratuito no Render.com:

1. Faça push do código para GitHub
2. Acesse [render.com](https://render.com)
3. Crie um novo Web Service
4. Conecte seu repositório GitHub
5. Configure as variáveis de ambiente
6. Deploy automático realizado!

Sua API estará disponível em: `https://seu-app-name.onrender.com`

## 📝 Exemplo de Fluxo Completo

### Sistema 1 - Criar Pesagem

```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pesagem.com","senha":"123456"}' \
  | jq -r '.data.token')

# 2. Criar pesagem
curl -X POST http://localhost:8000/api/pesagens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "motorista_id": 1,
    "placa_caminhao": "ABC-1234",
    "data_pesagem": "2026-05-21",
    "hora_entrada": "08:30:00",
    "pesagem_inicial": 5000.50
  }'
```

### Sistema 2 - Finalizar Pesagem

```bash
# 1. Listar pesagens pendentes
curl -X GET http://localhost:8000/api/pesagens/pendentes \
  -H "Authorization: Bearer $TOKEN"

# 2. Atualizar pesagem com dados finais
curl -X PUT http://localhost:8000/api/pesagens/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pesagem_final": 4200.50,
    "status": "Pesagem finalizada"
  }'
```

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se PostgreSQL está rodando
- Verifique credenciais em `.env`
- Execute `bash database/init.sh`

### Token inválido
- Verifique se o token foi incluído no header
- Verifique se não expirou (24 horas)
- Faça login novamente

### Acesso negado
- Verifique a role do usuário
- Verifique se o token é válido

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a [documentação da API](API_DOCUMENTATION.md)
2. Abra uma issue no GitHub
3. Entre em contato com o desenvolvedor

## 📄 Licença

Este projeto é fornecido como está para fins educacionais.

## 👨‍💼 Autor

Desenvolvido como Projeto Integrador - Faculdade

---

**Status:** ✅ Pronto para produção  
**Última atualização:** 21 de maio de 2026  
**Versão:** 1.0.0
