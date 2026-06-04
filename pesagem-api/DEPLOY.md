# Guia de Deploy - Sistema de Pesagem

Este documento descreve como fazer o deploy da API em diferentes ambientes.

## 📋 Índice

1. [Deploy Local (Desenvolvimento)](#deploy-local)
2. [Deploy com Docker](#deploy-com-docker)
3. [Deploy no Render.com (Produção)](#deploy-no-rendercom)
4. [Deploy em Servidor Tradicional](#deploy-em-servidor-tradicional)

---

## Deploy Local

### Pré-requisitos

- PHP 7.4+
- PostgreSQL 12+
- Git

### Passos

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd pesagem-api
   ```

2. **Configure o arquivo .env**
   ```bash
   cp .env.example .env
   ```
   
   Edite `.env` com suas credenciais:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pesagem_db
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   ```

3. **Crie o banco de dados**
   ```bash
   createdb -U postgres pesagem_db
   ```

4. **Execute o schema SQL**
   ```bash
   psql -U postgres -d pesagem_db -f database/schema.sql
   ```

5. **Inicie o servidor PHP**
   ```bash
   php -S localhost:8000 -t public
   ```

6. **Teste a API**
   ```bash
   curl http://localhost:8000/api/status
   ```

---

## Deploy com Docker

### Pré-requisitos

- Docker
- Docker Compose

### Passos

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd pesagem-api
   ```

2. **Inicie os containers**
   ```bash
   docker-compose up -d
   ```

3. **Verifique os containers**
   ```bash
   docker-compose ps
   ```

4. **Teste a API**
   ```bash
   curl http://localhost:8000/api/status
   ```

### Acessar Serviços

- **API**: http://localhost:8000
- **PgAdmin**: http://localhost:5050
  - Email: admin@pesagem.com
  - Senha: admin

### Parar os containers

```bash
docker-compose down
```

### Ver logs

```bash
docker-compose logs -f web
docker-compose logs -f db
```

---

## Deploy no Render.com

### Pré-requisitos

- Conta no [Render.com](https://render.com)
- Repositório GitHub com o código
- Conta GitHub

### Passos

#### 1. Prepare o Repositório

```bash
# Adicione todos os arquivos
git add .

# Faça commit
git commit -m "Prepare for Render deployment"

# Faça push
git push origin main
```

#### 2. Crie o Serviço Web no Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: pesagem-api
   - **Environment**: PHP
   - **Build Command**: `composer install`
   - **Start Command**: `vendor/bin/heroku-php-apache2 public/`
   - **Plan**: Free

#### 3. Configure Variáveis de Ambiente

Adicione as seguintes variáveis:

```
DB_HOST=<host-do-banco>
DB_PORT=5432
DB_NAME=pesagem_db
DB_USER=postgres
DB_PASSWORD=<sua-senha-segura>
JWT_SECRET=<gere-uma-chave-aleatória>
API_ENV=production
CORS_ORIGIN=*
```

#### 4. Crie o Banco de Dados PostgreSQL

1. No Render, clique em "New +" → "PostgreSQL"
2. Configure:
   - **Name**: pesagem-db
   - **Database**: pesagem_db
   - **User**: postgres
   - **Plan**: Free

3. Copie as credenciais e atualize as variáveis do Web Service

#### 5. Execute o Schema

Após criar o banco de dados:

1. Conecte via PgAdmin ou psql
2. Execute o arquivo `database/schema.sql`

```bash
psql postgresql://postgres:senha@host:5432/pesagem_db < database/schema.sql
```

#### 6. Deploy

O Render fará o deploy automaticamente quando você fizer push para o GitHub.

Sua API estará disponível em: `https://pesagem-api.onrender.com`

### Monitorar Deploy

1. Acesse o dashboard do Render
2. Clique no serviço "pesagem-api"
3. Veja os logs em "Logs"

### Verificar Status

```bash
curl https://pesagem-api.onrender.com/api/status
```

---

## Deploy em Servidor Tradicional

### Pré-requisitos

- Servidor Linux (Ubuntu/Debian)
- SSH acesso ao servidor
- Apache ou Nginx
- PHP 7.4+
- PostgreSQL 12+

### Passos

#### 1. Conecte ao Servidor

```bash
ssh usuario@seu-servidor.com
```

#### 2. Instale Dependências

```bash
# Atualize os pacotes
sudo apt update && sudo apt upgrade -y

# Instale PHP e extensões
sudo apt install php php-pgsql php-json php-curl -y

# Instale PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instale Git
sudo apt install git -y

# Instale Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### 3. Clone o Repositório

```bash
cd /var/www
sudo git clone <seu-repositorio> pesagem-api
cd pesagem-api
```

#### 4. Configure Permissões

```bash
sudo chown -R www-data:www-data /var/www/pesagem-api
sudo chmod -R 755 /var/www/pesagem-api
```

#### 5. Configure o Banco de Dados

```bash
# Acesse PostgreSQL
sudo -u postgres psql

# Execute dentro do psql:
CREATE DATABASE pesagem_db;
CREATE USER pesagem WITH PASSWORD 'sua_senha_segura';
ALTER ROLE pesagem SET client_encoding TO 'utf8';
ALTER ROLE pesagem SET default_transaction_isolation TO 'read committed';
ALTER ROLE pesagem SET default_transaction_deferrable TO on;
ALTER ROLE pesagem SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE pesagem_db TO pesagem;
\q
```

#### 6. Execute o Schema

```bash
psql -U pesagem -d pesagem_db -f database/schema.sql
```

#### 7. Configure o .env

```bash
sudo nano /var/www/pesagem-api/.env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pesagem_db
DB_USER=pesagem
DB_PASSWORD=sua_senha_segura
JWT_SECRET=sua_chave_secreta_muito_segura
API_ENV=production
```

#### 8. Configure Apache

Crie um arquivo de configuração:

```bash
sudo nano /etc/apache2/sites-available/pesagem-api.conf
```

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    ServerAlias www.seu-dominio.com
    DocumentRoot /var/www/pesagem-api/public

    <Directory /var/www/pesagem-api/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^(.*)$ index.php [L]
        </IfModule>
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/pesagem-api-error.log
    CustomLog ${APACHE_LOG_DIR}/pesagem-api-access.log combined
</VirtualHost>
```

#### 9. Ative o Site

```bash
sudo a2enmod rewrite
sudo a2ensite pesagem-api
sudo systemctl restart apache2
```

#### 10. Configure HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d seu-dominio.com
```

#### 11. Teste a API

```bash
curl https://seu-dominio.com/api/status
```

---

## Troubleshooting

### Erro: "Conexão recusada ao banco de dados"

**Solução:**
```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql

# Verifique as credenciais em .env
cat .env | grep DB_

# Teste a conexão
psql -U postgres -h localhost -d pesagem_db
```

### Erro: "Permissão negada"

**Solução:**
```bash
# Corrija permissões
sudo chown -R www-data:www-data /var/www/pesagem-api
sudo chmod -R 755 /var/www/pesagem-api
```

### Erro: "Módulo Apache não encontrado"

**Solução:**
```bash
# Ative o módulo rewrite
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Erro: "Token inválido em produção"

**Solução:**
```bash
# Gere uma nova chave JWT segura
openssl rand -base64 32

# Atualize em .env
JWT_SECRET=sua_nova_chave
```

---

## Checklist de Deploy

- [ ] Repositório GitHub criado e atualizado
- [ ] Arquivo `.env` configurado com credenciais seguras
- [ ] Banco de dados criado e schema executado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS certificado instalado (produção)
- [ ] Backups configurados
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Testes de API realizados
- [ ] Documentação atualizada

---

## Próximos Passos

1. **Monitoramento**: Configure alertas para uptime e erros
2. **Backups**: Configure backups automáticos do banco de dados
3. **Logs**: Monitore logs de erro e acesso
4. **Segurança**: Atualize regularmente dependências
5. **Performance**: Implemente cache e otimizações

---

**Versão:** 1.0.0  
**Última atualização:** 21 de maio de 2026
