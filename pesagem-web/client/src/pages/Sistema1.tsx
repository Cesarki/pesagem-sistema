import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockApi } from '@/hooks/useMockApi';
import { AlertCircle, CheckCircle, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Motorista {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
}

interface Pesagem {
  id: number;
  motorista_id: number;
  placa_caminhao: string;
  data_pesagem: string;
  hora_entrada: string;
  pesagem_inicial: number;
  status: string;
  criado_em: string;
}

export default function Sistema1() {
  const { post, request, isLoading } = useMockApi();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [loadingMotoristas, setLoadingMotoristas] = useState(true);
  const [loadingPesagens, setLoadingPesagens] = useState(true);

  const [formData, setFormData] = useState({
    motorista_id: '',
    placa_caminhao: '',
    data_pesagem: new Date().toISOString().split('T')[0],
    hora_entrada: new Date().toTimeString().slice(0, 5),
    pesagem_inicial: '',
  });

  // Carregar motoristas
  useEffect(() => {
    const loadMotoristas = async () => {
      try {
        const data = await request<Motorista[]>('/motoristas');
        setMotoristas(data);
      } catch (err) {
        toast.error('Erro ao carregar motoristas');
      } finally {
        setLoadingMotoristas(false);
      }
    };

    loadMotoristas();
  }, [request]);

  // Carregar pesagens
  useEffect(() => {
    const loadPesagens = async () => {
      try {
        const data = await request<Pesagem[]>('/pesagens');
        setPesagens(data || []);
      } catch (err) {
        toast.error('Erro ao carregar pesagens');
      } finally {
        setLoadingPesagens(false);
      }
    };

    loadPesagens();
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.motorista_id || !formData.placa_caminhao || !formData.pesagem_inicial) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const novaPesagem = await post<Pesagem>('/pesagens', {
        motorista_id: parseInt(formData.motorista_id),
        placa_caminhao: formData.placa_caminhao.toUpperCase(),
        data_pesagem: formData.data_pesagem,
        hora_entrada: formData.hora_entrada,
        pesagem_inicial: parseFloat(formData.pesagem_inicial),
      });

      setPesagens([novaPesagem, ...pesagens]);
      setFormData({
        motorista_id: '',
        placa_caminhao: '',
        data_pesagem: new Date().toISOString().split('T')[0],
        hora_entrada: new Date().toTimeString().slice(0, 5),
        pesagem_inicial: '',
      });

      toast.success('Pesagem criada com sucesso!');
    } catch (err) {
      toast.error('Erro ao criar pesagem');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Sistema 1 - Entrada de Caminhões</h2>
        <p className="text-gray-600 mt-1">
          Registre a entrada dos caminhões com os dados iniciais de pesagem
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Pesagem
              </CardTitle>
              <CardDescription>
                Preencha os dados do caminhão que está chegando
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="motorista">Motorista *</Label>
                  <Select
                    value={formData.motorista_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, motorista_id: value })
                    }
                    disabled={loadingMotoristas || isLoading}
                  >
                    <SelectTrigger id="motorista">
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {motoristas.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placa">Placa do Caminhão *</Label>
                  <Input
                    id="placa"
                    placeholder="ABC-1234"
                    value={formData.placa_caminhao}
                    onChange={(e) =>
                      setFormData({ ...formData, placa_caminhao: e.target.value })
                    }
                    disabled={isLoading}
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data">Data da Pesagem *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data_pesagem}
                    onChange={(e) =>
                      setFormData({ ...formData, data_pesagem: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora">Hora de Entrada *</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora_entrada}
                    onChange={(e) =>
                      setFormData({ ...formData, hora_entrada: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pesagem">Pesagem Inicial (kg) *</Label>
                  <Input
                    id="pesagem"
                    type="number"
                    placeholder="0.00"
                    value={formData.pesagem_inicial}
                    onChange={(e) =>
                      setFormData({ ...formData, pesagem_inicial: e.target.value })
                    }
                    disabled={isLoading}
                    step="0.01"
                    min="0"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Entrada
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pesagens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pesagens Registradas</CardTitle>
              <CardDescription>
                Todas as pesagens do dia em ordem de chegada
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPesagens ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : pesagens.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma pesagem registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pesagens.map((pesagem) => {
                    const motorista = motoristas.find((m) => m.id === pesagem.motorista_id);
                    return (
                      <div
                        key={pesagem.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {motorista?.nome || 'Motorista desconhecido'}
                            </h4>
                            <p className="text-sm text-gray-500">{pesagem.placa_caminhao}</p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              pesagem.status === 'Pesagem finalizada'
                                ? 'bg-green-100 text-green-800'
                                : pesagem.status === 'Descarregando'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {pesagem.status}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Hora de Entrada</p>
                            <p className="font-medium text-gray-900">{pesagem.hora_entrada}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Pesagem Inicial</p>
                            <p className="font-medium text-gray-900">{pesagem.pesagem_inicial} kg</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                          ID: {pesagem.id} • {new Date(pesagem.criado_em).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
