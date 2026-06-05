import { useState, useCallback } from 'react';

// Dados simulados
const mockMotoristas = [
  { id: 1, nome: 'João Silva', documento: '12345678901', telefone: '11987654321', placa_caminhao: 'ABC-1234' },
  { id: 2, nome: 'Maria Santos', documento: '98765432101', telefone: '11987654322', placa_caminhao: 'XYZ-5678' },
  { id: 3, nome: 'Pedro Oliveira', documento: '55555555555', telefone: '11987654323', placa_caminhao: 'DEF-9012' },
  { id: 4, nome: 'Ana Costa', documento: '44444444444', telefone: '11987654324', placa_caminhao: 'GHI-3456' },
  { id: 5, nome: 'Carlos Ferreira', documento: '33333333333', telefone: '11987654325', placa_caminhao: 'JKL-7890' },
];

let mockMotoristasCadastrados = [...mockMotoristas];

let mockPesagens = [
  {
    id: 1,
    motorista_id: 1,
    placa_caminhao: 'ABC-1234',
    data_pesagem: '2026-05-21',
    hora_entrada: '08:30:00',
    hora_saida: '09:45:00',
    pesagem_inicial: 5000.5,
    pesagem_final: 3500.25,
    status: 'Pesagem finalizada',
    criado_em: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    motorista_id: 2,
    placa_caminhao: 'XYZ-5678',
    data_pesagem: '2026-05-21',
    hora_entrada: '09:15:00',
    hora_saida: '10:30:00',
    pesagem_inicial: 7200.75,
    pesagem_final: 4800.5,
    status: 'Pesagem finalizada',
    criado_em: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 3,
    motorista_id: 3,
    placa_caminhao: 'DEF-9012',
    data_pesagem: '2026-05-21',
    hora_entrada: '10:00:00',
    hora_saida: '11:15:00',
    pesagem_inicial: 6500.0,
    pesagem_final: 4200.0,
    status: 'Pesagem finalizada',
    criado_em: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 4,
    motorista_id: 4,
    placa_caminhao: 'GHI-3456',
    data_pesagem: '2026-06-04',
    hora_entrada: '14:20:00',
    hora_saida: null,
    pesagem_inicial: 5500.0,
    pesagem_final: null,
    status: 'Pesando',
    criado_em: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 5,
    motorista_id: 5,
    placa_caminhao: 'JKL-7890',
    data_pesagem: '2026-06-04',
    hora_entrada: '15:00:00',
    hora_saida: '16:10:00',
    pesagem_inicial: 4800.0,
    pesagem_final: 2900.75,
    status: 'Pesagem finalizada',
    criado_em: new Date(Date.now() - 300000).toISOString(),
  },
];

// Inicializar nextId com o maior ID existente + 1
let nextId = Math.max(...mockPesagens.map((p) => p.id), 0) + 1;

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
          return mockMotoristasCadastrados as T;
        }

        if (endpoint === '/pesagens') {
          return mockPesagens as T;
        }

        if (endpoint === '/pesagens/pendentes') {
          // Retornar pesagens que ainda nao foram finalizadas (Pesando ou Descarregando)
          const pendentes = mockPesagens.filter(
            (p) => p.pesagem_final === null || p.status === 'Descarregando'
          );
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
      // Retornar TODAS as pesagens (Pesando, Descarregando, Finalizada)
      const pesagensCompletas = mockPesagens
        .map((p) => {
          const motorista = mockMotoristasCadastrados.find((m) => m.id === p.motorista_id);
          return {
            id: p.id,
            motorista: {
              nome: motorista?.nome || 'Motorista desconhecido',
              documento: motorista?.documento || '',
              telefone: motorista?.telefone || '',
            },
            placa_caminhao: p.placa_caminhao,
            data_pesagem: p.data_pesagem,
            hora_entrada: p.hora_entrada,
            hora_saida: p.hora_saida || '',
            pesagem_inicial: p.pesagem_inicial,
            pesagem_final: p.pesagem_final || 0,
            status: p.status,
          };
        });
      return pesagensCompletas as any;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const postMotorista = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        await delay();

        if (endpoint === '/motoristas') {
          const novoId = Math.max(...mockMotoristasCadastrados.map((m) => m.id), 0) + 1;
          const novoMotorista = {
            id: novoId,
            nome: body.nome,
            documento: body.documento,
            telefone: body.telefone,
            placa_caminhao: body.placa_caminhao,
          };
          mockMotoristasCadastrados.push(novoMotorista);
          return novoMotorista as T;
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

  const putMotorista = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        await delay();

        const match = endpoint.match(/\/motoristas\/(\d+)/);
        if (match) {
          const id = parseInt(match[1]);
          const motoristaIndex = mockMotoristasCadastrados.findIndex((m) => m.id === id);

          if (motoristaIndex === -1) {
            throw new Error('Motorista não encontrado');
          }

          const motoristaAtualizado = {
            ...mockMotoristasCadastrados[motoristaIndex],
            ...body,
          };

          mockMotoristasCadastrados[motoristaIndex] = motoristaAtualizado;
          return motoristaAtualizado as T;
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

  const deleteMotorista = useCallback(
    async (endpoint: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await delay();

        const match = endpoint.match(/\/motoristas\/(\d+)/);
        if (match) {
          const id = parseInt(match[1]);
          const motoristaIndex = mockMotoristasCadastrados.findIndex((m) => m.id === id);

          if (motoristaIndex === -1) {
            throw new Error('Motorista não encontrado');
          }

          mockMotoristasCadastrados.splice(motoristaIndex, 1);
          return;
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

  return { request, post, put, isLoading, error, getPesagensCompletas, postMotorista, putMotorista, deleteMotorista };
};
