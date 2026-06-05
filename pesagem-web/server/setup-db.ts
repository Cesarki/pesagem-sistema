import { query } from './db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao executar migrations:', err);
    process.exit(1);
  }
}

runMigrations();
