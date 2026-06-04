import { useState, useCallback } from 'react';

// Dados simulados
const mockMotoristas = [
  { id: 1, nome: 'João Silva', documento: '12345678901', telefone: '11987654321' },
  { id: 2, nome: 'Maria Santos', documento: '98765432101', telefone: '11987654322' },
  { id: 3, nome: 'Pedro Oliveira', documento: '55555555555', telefone: '11987654323' },
  { id: 4, nome: 'Ana Costa', documento: '44444444444', telefone: '11987654324' },
  { id: 5, nome: 'Carlos Ferreira', documento: '33333333333', telefone: '11987654325' },
];

let mockPesagens = [
  {
    id: 1,
    motorista_id: 1,
    placa_caminhao: 'ABC-1234',
    data_pesagem: '2026-05-21',
    hora_entrada: '08:30:00',
    hora_saida: null,
    pesagem_inicial: 5000.5,
    pesagem_final: null,
    status: 'Pesando',
    criado_em: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    motorista_id: 2,
    placa_caminhao: 'XYZ-5678',
    data_pesagem: '2026-05-21',
    hora_entrada: '09:15:00',
    hora_saida: null,
    pesagem_inicial: 7200.75,
    pesagem_final: null,
    status: 'Descarregando',
    criado_em: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 3,
    motorista_id: 3,
    placa_caminhao: 'DEF-9012',
    data_pesagem: '2026-05-21',
    hora_entrada: '10:00:00',
    hora_saida: null,
    pesagem_inicial: 6500.0,
    pesagem_final: null,
    status: 'Pesando',
    criado_em: new Date(Date.now() - 1800000).toISOString(),
  },
];

let nextId = 100;

// Dados de pesagens completas (entrada + saída)
const mockPesagensCompletas = [
  {
    id: 1,
    motorista: {
      nome: 'João Silva',
      documento: '123.456.789-00',
      telefone: '(11) 98765-4321',
    },
    placa_caminhao: 'ABC-1234',
    data_pesagem: '04/06/2026',
    hora_entrada: '08:30',
    hora_saida: '09:15',
    pesagem_inicial: 5000,
    pesagem_final: 3500,
    status: 'Pesagem finalizada',
  },
  {
    id: 2,
    motorista: {
      nome: 'Maria Santos',
      documento: '987.654.321-00',
      telefone: '(11) 99876-5432',
    },
    placa_caminhao: 'XYZ-5678',
    data_pesagem: '04/06/2026',
    hora_entrada: '09:45',
    hora_saida: '10:30',
    pesagem_inicial: 4500,
    pesagem_final: 2800,
    status: 'Pesagem finalizada',
  },
  {
    id: 3,
    motorista: {
      nome: 'Pedro Costa',
      documento: '456.789.123-00',
      telefone: '(11) 97654-3210',
    },
    placa_caminhao: 'DEF-9012',
    data_pesagem: '04/06/2026',
    hora_entrada: '11:00',
    hora_saida: '11:45',
    pesagem_inicial: 6000,
    pesagem_final: 4200,
    status: 'Pesagem finalizada',
  },
  {
    id: 4,
    motorista: {
      nome: 'Ana Oliveira',
      documento: '789.123.456-00',
      telefone: '(11) 96543-2109',
    },
    placa_caminhao: 'GHI-3456',
    data_pesagem: '04/06/2026',
    hora_entrada: '13:20',
    hora_saida: '14:05',
    pesagem_inicial: 5500,
    pesagem_final: 3900,
    status: 'Pesagem finalizada',
  },
  {
    id: 5,
    motorista: {
      nome: 'Carlos Mendes',
      documento: '321.654.987-00',
      telefone: '(11) 95432-1098',
    },
    placa_caminhao: 'JKL-7890',
    data_pesagem: '04/06/2026',
    hora_entrada: '14:30',
    hora_saida: '',
    pesagem_inicial: 4800,
    pesagem_final: 0,
    status: 'Pesando',
  },
];

export const useMockApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular delay de rede
  const delay = (ms: number = 800) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const request = useCallback(
    async <T,>(endpoint: string): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        await delay();

        if (endpoint === '/motoristas') {
          return mockMotoristas as T;
        }

        if (endpoint === '/pesagens') {
          return mockPesagens as T;
        }

        if (endpoint === '/pesagens/pendentes') {
          const pendentes = mockPesagens.filter((p) => p.pesagem_final === null);
          return pendentes as T;
        }

        throw new Error('Endpoint não encontrado');
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
        await delay();

        if (endpoint === '/pesagens') {
          const novoId = nextId++;
          const novaPesagem = {
            id: novoId,
            motorista_id: body.motorista_id,
            placa_caminhao: body.placa_caminhao,
            data_pesagem: body.data_pesagem,
            hora_entrada: body.hora_entrada,
            hora_saida: null,
            pesagem_inicial: body.pesagem_inicial,
            pesagem_final: null,
            status: 'Pesando',
            criado_em: new Date().toISOString(),
          };
          mockPesagens.unshift(novaPesagem);
          return novaPesagem as T;
        }

        throw new Error('Endpoint não encontrado');
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
        await delay();

        const match = endpoint.match(/\/pesagens\/(\d+)/);
        if (match) {
          const id = parseInt(match[1]);
          const pesagemIndex = mockPesagens.findIndex((p) => p.id === id);

          if (pesagemIndex === -1) {
            throw new Error('Pesagem não encontrada');
          }

          const pesagemAtualizada = {
            ...mockPesagens[pesagemIndex],
            ...body,
            hora_saida: body.status === 'Pesagem finalizada' ? new Date().toTimeString().slice(0, 5) : null,
            atualizado_em: new Date().toISOString(),
          };

          mockPesagens[pesagemIndex] = pesagemAtualizada;
          return pesagemAtualizada as T;
        }

        throw new Error('Endpoint não encontrado');
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

  const getPesagensCompletas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await delay();
      return mockPesagensCompletas;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { request, post, put, isLoading, error, getPesagensCompletas };
};
