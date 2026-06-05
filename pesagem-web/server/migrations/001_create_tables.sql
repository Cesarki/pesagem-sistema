-- Tabela de Motoristas
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
