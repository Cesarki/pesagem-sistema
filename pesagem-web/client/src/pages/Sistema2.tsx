import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockApi } from '@/hooks/useMockApi';
import { AlertCircle, CheckCircle, Loader2, Truck, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Pesagem {
  id: number;
  motorista_id: number;
  placa_caminhao: string;
  data_pesagem: string;
  hora_entrada: string;
  hora_saida?: string;
  pesagem_inicial: number;
  pesagem_final?: number;
  status: string;
  criado_em: string;
}

interface Motorista {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
}

export default function Sistema2() {
  const { request, put, isLoading } = useMockApi();
  const [pesagensAbiertas, setPesagensAbiertas] = useState<Pesagem[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loadingPesagens, setLoadingPesagens] = useState(true);
  const [selectedPesagem, setSelectedPesagem] = useState<Pesagem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [finalizandoId, setFinalizandoId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    pesagem_final: '',
    status: 'Pesagem finalizada',
  });

  // Carregar motoristas
  useEffect(() => {
    const loadMotoristas = async () => {
      try {
        const data = await request<Motorista[]>('/motoristas');
        setMotoristas(data);
      } catch (err) {
        console.error('Erro ao carregar motoristas');
      }
    };

    loadMotoristas();
  }, [request]);

  // Carregar pesagens pendentes
  const loadPesagensAbiertas = async () => {
    setLoadingPesagens(true);
    try {
      const data = await request<Pesagem[]>('/pesagens/pendentes');
      setPesagensAbiertas(data || []);
    } catch (err) {
      toast.error('Erro ao carregar pesagens pendentes');
    } finally {
      setLoadingPesagens(false);
    }
  };

  useEffect(() => {
    loadPesagensAbiertas();
    const interval = setInterval(loadPesagensAbiertas, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, [request]);

  const handleSelectPesagem = (pesagem: Pesagem) => {
    setSelectedPesagem(pesagem);
    setFormData({
      pesagem_final: '',
      status: 'Pesagem finalizada',
    });
    setShowDialog(true);
  };

  const handleFinalizarPesagem = async () => {
    if (!selectedPesagem || !formData.pesagem_final) {
      toast.error('Preencha a pesagem final');
      return;
    }

    const pesagemFinal = parseFloat(formData.pesagem_final);

    // Validações
    if (isNaN(pesagemFinal) || pesagemFinal < 0) {
      toast.error('Peso final deve ser um número válido e positivo');
      return;
    }

    if (formData.status === 'Pesagem finalizada' && pesagemFinal === 0) {
      toast.error('Peso final não pode ser zero para pesagem finalizada');
      return;
    }

    setFinalizandoId(selectedPesagem.id);

    try {
      await put(`/pesagens/${selectedPesagem.id}`, {
        pesagem_final: pesagemFinal,
        status: formData.status,
      });

      // Mensagens diferenciadas por status
      if (formData.status === 'Pesagem finalizada') {
        toast.success('✅ Pesagem finalizada com sucesso!');
      } else {
        toast.success('⏳ Caminhão marcado como descarregando');
      }

      setShowDialog(false);
      setSelectedPesagem(null);
      await loadPesagensAbiertas();
    } catch (err) {
      toast.error('Erro ao atualizar pesagem');
    } finally {
      setFinalizandoId(null);
    }
  };

  const calcularDiferenca = (pesagemInicial: number, pesagemFinal: string) => {
    if (!pesagemFinal) return 0;
    return parseFloat(pesagemFinal) - pesagemInicial;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Sistema 2 - Saída de Caminhões</h2>
        <p className="text-gray-600 mt-1">
          Finalize as pesagens registrando o peso final e o status de saída
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pesagens Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">{pesagensAbiertas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Descarregando</p>
              <p className="text-3xl font-bold text-gray-900">
                {pesagensAbiertas.filter((p) => p.status === 'Descarregando').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pesando</p>
              <p className="text-3xl font-bold text-gray-900">
                {pesagensAbiertas.filter((p) => p.status === 'Pesando').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pesagens */}
      <Card>
        <CardHeader>
          <CardTitle>Pesagens Aguardando Finalização</CardTitle>
          <CardDescription>
            Clique em uma pesagem para registrar a saída do caminhão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPesagens ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : pesagensAbiertas.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Nenhuma pesagem pendente!</p>
              <p className="text-gray-600 mt-1">Todas as pesagens foram finalizadas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pesagensAbiertas.map((pesagem) => {
                const motorista = motoristas.find((m) => m.id === pesagem.motorista_id);
                return (
                  <div
                    key={pesagem.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => handleSelectPesagem(pesagem)}
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
                          pesagem.status === 'Descarregando'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {pesagem.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Entrada</p>
                        <p className="font-medium text-gray-900">{pesagem.hora_entrada}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Peso Inicial</p>
                        <p className="font-medium text-gray-900">{pesagem.pesagem_inicial} kg</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                      ID: {pesagem.id} • {new Date(pesagem.criado_em).toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para finalizar pesagem */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pesagem</DialogTitle>
            <DialogDescription>
              Registre o peso final e o status de saída do caminhão
            </DialogDescription>
          </DialogHeader>

          {selectedPesagem && (
            <div className="space-y-4">
              {/* Informações do caminhão */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Motorista:</span>
                  <span className="font-medium text-gray-900">
                    {motoristas.find((m) => m.id === selectedPesagem.motorista_id)?.nome}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Placa:</span>
                  <span className="font-medium text-gray-900">{selectedPesagem.placa_caminhao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso Inicial:</span>
                  <span className="font-medium text-gray-900">{selectedPesagem.pesagem_inicial} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrada:</span>
                  <span className="font-medium text-gray-900">{selectedPesagem.hora_entrada}</span>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pesagem-final">Peso Final (kg) *</Label>
                  <Input
                    id="pesagem-final"
                    type="number"
                    placeholder="0.00"
                    value={formData.pesagem_final}
                    onChange={(e) =>
                      setFormData({ ...formData, pesagem_final: e.target.value })
                    }
                    disabled={finalizandoId === selectedPesagem.id}
                    step="0.01"
                    min="0"
                  />
                </div>

                {formData.pesagem_final && (
                  <>
                    {calcularDiferenca(selectedPesagem.pesagem_inicial, formData.pesagem_final) > 0 ? (
                      <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800 mb-1">
                            Atenção!
                          </p>
                          <p className="text-sm text-red-700">
                            Este caminhão está saindo com o peso maior do que quando chegou. Verifique!
                          </p>
                          <p className="text-sm text-red-600 mt-2">
                            <span className="font-semibold">Diferença de peso:</span> +{calcularDiferenca(selectedPesagem.pesagem_inicial, formData.pesagem_final)} kg
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Diferença de peso:</span>{' '}
                          {calcularDiferenca(selectedPesagem.pesagem_inicial, formData.pesagem_final)} kg
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status">Status da Saída *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    disabled={finalizandoId === selectedPesagem.id}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pesagem finalizada">
                        ✅ Pesagem Finalizada (Saída completa)
                      </SelectItem>
                      <SelectItem value="Descarregando">
                        ⏳ Descarregando (Continua em andamento)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {formData.status === 'Pesagem finalizada'
                      ? 'Caminhão sairá do sistema após confirmação'
                      : 'Caminhão continuará pendente para finalização posterior'}
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={finalizandoId === selectedPesagem.id}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleFinalizarPesagem}
                  disabled={finalizandoId === selectedPesagem.id || !formData.pesagem_final}
                  className="flex-1"
                  variant={formData.status === 'Pesagem finalizada' ? 'default' : 'secondary'}
                >
                  {finalizandoId === selectedPesagem.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : formData.status === 'Pesagem finalizada' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finalizar Pesagem
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Marcar como Descarregando
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
