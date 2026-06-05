import express from 'express';
import { query } from './db';
import path from 'path';

const app = express();
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

// ============ ROTAS DE PESAGENS ============

// GET /api/pesagens - Retorna todas as pesagens
app.get('/api/pesagens', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, m.nome as motorista_nome, m.documento, m.telefone
       FROM pesagens p
       LEFT JOIN motoristas m ON p.motorista_id = m.id
       ORDER BY p.criado_em DESC`
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
      `SELECT p.*, m.nome as motorista_nome, m.documento, m.telefone
       FROM pesagens p
       LEFT JOIN motoristas m ON p.motorista_id = m.id
       WHERE p.pesagem_final IS NULL OR p.status = 'Descarregando'
       ORDER BY p.criado_em DESC`
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
      `INSERT INTO pesagens 
       (motorista_id, placa_caminhao, data_pesagem, hora_entrada, pesagem_inicial, status)
       VALUES ($1, $2, $3, $4, $5, 'Pesando')
       RETURNING *`,
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
      `INSERT INTO motoristas (nome, documento, telefone, placa_caminhao)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
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
      `UPDATE motoristas 
       SET nome = $1, documento = $2, telefone = $3, placa_caminhao = $4, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
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
  res.sendFile('public/index.html', { root: '.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
