#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n========================================');
console.log('Configurando PostgreSQL no Projeto');
console.log('========================================\n');

// PASSO 2: Criar arquivo .env
console.log('[PASSO 2] Criando arquivo .env...');

const envContent = `DATABASE_URL=postgresql://pesagem_user:1seXnY50YRG3Sarhe5agqq3PSnl1UTq3@dpg-d8h3f9c8aovs73en8a90-a.oregon-postgres.render.com/pesagem_db_3d44
NODE_ENV=production
PORT=3000
`;

fs.writeFileSync('.env', envContent);
console.log('✅ Arquivo .env criado com sucesso!\n');

// Adicionar .env ao .gitignore
console.log('[PASSO 2.5] Adicionando .env ao .gitignore...');

let gitignoreContent = '';
if (fs.existsSync('.gitignore')) {
  gitignoreContent = fs.readFileSync('.gitignore', 'utf-8');
}

if (!gitignoreContent.includes('.env')) {
  gitignoreContent += '\n.env\n.env.local\n.env.*.local';
  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('✅ .env adicionado ao .gitignore!\n');
} else {
  console.log('ℹ️  .env já está no .gitignore\n');
}

// PASSO 3: Criar arquivo server/db.ts
console.log('[PASSO 3] Criando arquivo server/db.ts...');

if (!fs.existsSync('server')) {
  fs.mkdirSync('server', { recursive: true });
  console.log('✅ Pasta server criada!');
}

const dbContent = `import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Erro na conexão com banco:', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = async () => {
  return pool.connect();
};

export default pool;
`;

fs.writeFileSync('server/db.ts', dbContent);
console.log('✅ Arquivo server/db.ts criado!\n');

// PASSO 4: Criar arquivo SQL com tabelas
console.log('[PASSO 4] Criando arquivo server/migrations/001_create_tables.sql...');

if (!fs.existsSync('server/migrations')) {
  fs.mkdirSync('server/migrations', { recursive: true });
  console.log('✅ Pasta server/migrations criada!');
}

const sqlContent = `-- Tabela de Motoristas
CREATE TABLE IF NOT EXISTS motoristas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(20) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  placa_caminhao VARCHAR(20) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pesagens
CREATE TABLE IF NOT EXISTS pesagens (
  id SERIAL PRIMARY KEY,
  motorista_id INTEGER NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
  placa_caminhao VARCHAR(20) NOT NULL,
  data_pesagem DATE NOT NULL,
  hora_entrada TIME NOT NULL,
  hora_saida TIME,
  pesagem_inicial DECIMAL(10, 2) NOT NULL,
  pesagem_final DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'Pesando',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pesagens_motorista_id ON pesagens(motorista_id);
CREATE INDEX IF NOT EXISTS idx_pesagens_status ON pesagens(status);
CREATE INDEX IF NOT EXISTS idx_pesagens_data ON pesagens(data_pesagem);
`;

fs.writeFileSync('server/migrations/001_create_tables.sql', sqlContent);
console.log('✅ Arquivo server/migrations/001_create_tables.sql criado!\n');

// PASSO 5: Criar arquivo server/setup-db.ts
console.log('[PASSO 5] Criando arquivo server/setup-db.ts...');

const setupDbContent = `import { query } from './db';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Iniciando migrations...');

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'migrations', '001_create_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Executar cada comando SQL
    const commands = sql.split(';').filter((cmd) => cmd.trim());
    for (const command of commands) {
      if (command.trim()) {
        await query(command);
        console.log('✅ Comando executado:', command.substring(0, 50) + '...');
      }
    }

    console.log('✅ Migrations concluídas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao executar migrations:', err);
    process.exit(1);
  }
}

runMigrations();
`;

fs.writeFileSync('server/setup-db.ts', setupDbContent);
console.log('✅ Arquivo server/setup-db.ts criado!\n');

// PASSO 6: Atualizar server/index.ts
console.log('[PASSO 6] Atualizando arquivo server/index.ts...');

const indexContent = `import express from 'express';
import { query } from './db';
import path from 'path';

const app = express();
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ============ ROTAS DE PESAGENS ============

// GET /api/pesagens - Retorna todas as pesagens
app.get('/api/pesagens', async (req, res) => {
  try {
    const result = await query(
      \`SELECT p.*, m.nome as motorista_nome, m.documento, m.telefone
       FROM pesagens p
       LEFT JOIN motoristas m ON p.motorista_id = m.id
       ORDER BY p.criado_em DESC\`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pesagens:', err);
    res.status(500).json({ error: 'Erro ao buscar pesagens' });
  }
});

// GET /api/pesagens/pendentes - Retorna pesagens pendentes
app.get('/api/pesagens/pendentes', async (req, res) => {
  try {
    const result = await query(
      \`SELECT p.*, m.nome as motorista_nome, m.documento, m.telefone
       FROM pesagens p
       LEFT JOIN motoristas m ON p.motorista_id = m.id
       WHERE p.pesagem_final IS NULL OR p.status = 'Descarregando'
       ORDER BY p.criado_em DESC\`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pesagens pendentes:', err);
    res.status(500).json({ error: 'Erro ao buscar pesagens pendentes' });
  }
});

// POST /api/pesagens - Criar nova pesagem
app.post('/api/pesagens', async (req, res) => {
  try {
    const {
      motorista_id,
      placa_caminhao,
      data_pesagem,
      hora_entrada,
      pesagem_inicial,
    } = req.body;

    const result = await query(
      \`INSERT INTO pesagens 
       (motorista_id, placa_caminhao, data_pesagem, hora_entrada, pesagem_inicial, status)
       VALUES ($1, $2, $3, $4, $5, 'Pesando')
       RETURNING *\`,
      [motorista_id, placa_caminhao, data_pesagem, hora_entrada, pesagem_inicial]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar pesagem:', err);
    res.status(500).json({ error: 'Erro ao criar pesagem' });
  }
});

// PUT /api/pesagens/:id - Atualizar pesagem
app.put('/api/pesagens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pesagem_final, status } = req.body;

    let updateQuery = 'UPDATE pesagens SET status = $1, atualizado_em = CURRENT_TIMESTAMP';
    let params: any[] = [status, id];

    if (pesagem_final !== undefined && pesagem_final !== null) {
      updateQuery += ', pesagem_final = $2, hora_saida = CURRENT_TIME';
      params = [status, pesagem_final, id];
    } else {
      params = [status, id];
    }

    updateQuery += ' WHERE id = $' + (params.length) + ' RETURNING *';

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pesagem não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar pesagem:', err);
    res.status(500).json({ error: 'Erro ao atualizar pesagem' });
  }
});

// ============ ROTAS DE MOTORISTAS ============

// GET /api/motoristas - Retorna todos os motoristas
app.get('/api/motoristas', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM motoristas ORDER BY nome ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar motoristas:', err);
    res.status(500).json({ error: 'Erro ao buscar motoristas' });
  }
});

// POST /api/motoristas - Criar novo motorista
app.post('/api/motoristas', async (req, res) => {
  try {
    const { nome, documento, telefone, placa_caminhao } = req.body;

    const result = await query(
      \`INSERT INTO motoristas (nome, documento, telefone, placa_caminhao)
       VALUES ($1, $2, $3, $4)
       RETURNING *\`,
      [nome, documento, telefone, placa_caminhao]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar motorista:', err);
    res.status(500).json({ error: 'Erro ao criar motorista' });
  }
});

// PUT /api/motoristas/:id - Atualizar motorista
app.put('/api/motoristas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, documento, telefone, placa_caminhao } = req.body;

    const result = await query(
      \`UPDATE motoristas 
       SET nome = $1, documento = $2, telefone = $3, placa_caminhao = $4, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *\`,
      [nome, documento, telefone, placa_caminhao, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar motorista:', err);
    res.status(500).json({ error: 'Erro ao atualizar motorista' });
  }
});

// DELETE /api/motoristas/:id - Deletar motorista
app.delete('/api/motoristas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM motoristas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    res.json({ message: 'Motorista deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar motorista:', err);
    res.status(500).json({ error: 'Erro ao deletar motorista' });
  }
});

// SPA - Servir index.html para rotas não encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 Servidor rodando na porta \${PORT}\`);
});
`;

fs.writeFileSync('server/index.ts', indexContent);
console.log('✅ Arquivo server/index.ts atualizado!\n');

// PASSO 7: Atualizar client/src/hooks/useMockApi.ts
console.log('[PASSO 7] Atualizando arquivo client/src/hooks/useMockApi.ts...');

const useMockApiContent = `import { useCallback, useState } from 'react';

export const useMockApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(endpoint: string): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(\`/api\${endpoint}\`);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const data = await response.json();
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const post = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(\`/api\${endpoint}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const put = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(\`/api\${endpoint}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteRequest = useCallback(
    async (endpoint: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(\`/api\${endpoint}\`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { request, post, put, deleteRequest, isLoading, error };
};
`;

fs.writeFileSync('client/src/hooks/useMockApi.ts', useMockApiContent);
console.log('✅ Arquivo client/src/hooks/useMockApi.ts atualizado!\n');

console.log('========================================');
console.log('✅ TODOS OS ARQUIVOS CRIADOS COM SUCESSO!');
console.log('========================================\n');

console.log('[PRÓXIMOS PASSOS]');
console.log('1. Execute: npm run build');
console.log('2. Execute: git add -A');
console.log('3. Execute: git commit -m "Integrar PostgreSQL no Render"');
console.log('4. Execute: git push origin main\n');

console.log('✅ Script finalizado!\n');
