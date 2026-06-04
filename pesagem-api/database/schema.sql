-- =====================================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA DE PESAGEM
-- =====================================================

-- Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'operador')),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por email
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- =====================================================
-- TABELA: MOTORISTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS motoristas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por documento
CREATE INDEX idx_motoristas_documento ON motoristas(documento);

-- =====================================================
-- TABELA: PESAGENS
-- =====================================================
CREATE TABLE IF NOT EXISTS pesagens (
    id SERIAL PRIMARY KEY,
    motorista_id INTEGER NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
    placa_caminhao VARCHAR(20) NOT NULL,
    data_pesagem DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_saida TIME,
    pesagem_inicial DECIMAL(10, 2) NOT NULL,
    pesagem_final DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'Pesando' CHECK (status IN ('Pesando', 'Descarregando', 'Pesagem finalizada')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_pesagens_motorista_id ON pesagens(motorista_id);
CREATE INDEX idx_pesagens_data_pesagem ON pesagens(data_pesagem);
CREATE INDEX idx_pesagens_status ON pesagens(status);
CREATE INDEX idx_pesagens_placa ON pesagens(placa_caminhao);

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================

-- Inserir usuários de exemplo
INSERT INTO usuarios (nome, email, senha, role) VALUES
('Admin Sistema', 'admin@pesagem.com', '$2y$10$YIjlrPNo0YM07VIGbW.H2OPST9/PgBkqquzi.Oy1A9YT7DT5W2JQm', 'admin'),
('Operador 1', 'operador1@pesagem.com', '$2y$10$YIjlrPNo0YM07VIGbW.H2OPST9/PgBkqquzi.Oy1A9YT7DT5W2JQm', 'operador'),
('Operador 2', 'operador2@pesagem.com', '$2y$10$YIjlrPNo0YM07VIGbW.H2OPST9/PgBkqquzi.Oy1A9YT7DT5W2JQm', 'operador')
ON CONFLICT DO NOTHING;

-- Inserir motoristas de exemplo
INSERT INTO motoristas (nome, documento, telefone) VALUES
('João Silva', '12345678901', '11987654321'),
('Maria Santos', '98765432101', '11987654322'),
('Pedro Oliveira', '55555555555', '11987654323'),
('Ana Costa', '44444444444', '11987654324'),
('Carlos Ferreira', '33333333333', '11987654325')
ON CONFLICT DO NOTHING;

-- Inserir pesagens de exemplo
INSERT INTO pesagens (motorista_id, placa_caminhao, data_pesagem, hora_entrada, pesagem_inicial, status) VALUES
(1, 'ABC-1234', '2026-05-21', '08:30:00', 5000.50, 'Pesando'),
(2, 'XYZ-5678', '2026-05-21', '09:15:00', 7200.75, 'Descarregando'),
(3, 'DEF-9012', '2026-05-21', '10:00:00', 6500.00, 'Pesando'),
(1, 'ABC-1234', '2026-05-20', '14:30:00', 4800.25, 'Pesagem finalizada'),
(4, 'GHI-3456', '2026-05-20', '15:45:00', 8100.00, 'Pesagem finalizada')
ON CONFLICT DO NOTHING;

-- Atualizar pesagens finalizadas com dados de saída
UPDATE pesagens 
SET pesagem_final = 4200.50, hora_saida = '15:00:00', atualizado_em = CURRENT_TIMESTAMP
WHERE id = 4;

UPDATE pesagens 
SET pesagem_final = 7800.00, hora_saida = '16:30:00', atualizado_em = CURRENT_TIMESTAMP
WHERE id = 5;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para relatório de pesagens com dados do motorista
CREATE OR REPLACE VIEW v_pesagens_completas AS
SELECT 
    p.id,
    p.motorista_id,
    m.nome as motorista_nome,
    m.documento as motorista_documento,
    m.telefone as motorista_telefone,
    p.placa_caminhao,
    p.data_pesagem,
    p.hora_entrada,
    p.hora_saida,
    p.pesagem_inicial,
    p.pesagem_final,
    CASE 
        WHEN p.pesagem_final IS NOT NULL THEN (p.pesagem_final - p.pesagem_inicial)
        ELSE NULL
    END as diferenca_peso,
    p.status,
    p.criado_em,
    p.atualizado_em
FROM pesagens p
LEFT JOIN motoristas m ON p.motorista_id = m.id
ORDER BY p.data_pesagem DESC, p.hora_entrada DESC;

-- View para pesagens pendentes (não finalizadas)
CREATE OR REPLACE VIEW v_pesagens_pendentes AS
SELECT 
    p.id,
    p.motorista_id,
    m.nome as motorista_nome,
    m.documento as motorista_documento,
    p.placa_caminhao,
    p.data_pesagem,
    p.hora_entrada,
    p.pesagem_inicial,
    p.status,
    p.criado_em
FROM pesagens p
LEFT JOIN motoristas m ON p.motorista_id = m.id
WHERE p.pesagem_final IS NULL
ORDER BY p.criado_em DESC;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema com controle de acesso';
COMMENT ON TABLE motoristas IS 'Cadastro de motoristas que realizam as pesagens';
COMMENT ON TABLE pesagens IS 'Registro de todas as pesagens de caminhões';

COMMENT ON COLUMN pesagens.status IS 'Status da pesagem: Pesando, Descarregando ou Pesagem finalizada';
COMMENT ON COLUMN pesagens.pesagem_final IS 'Preenchido quando a pesagem é finalizada (Sistema 2)';
COMMENT ON COLUMN pesagens.hora_saida IS 'Preenchida quando a pesagem é finalizada';
