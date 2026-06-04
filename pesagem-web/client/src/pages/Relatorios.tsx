import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMockApi } from '@/hooks/useMockApi';
import { ChevronDown, Download, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PesagemCompleta {
  id: number;
  motorista: {
    nome: string;
    documento: string;
    telefone: string;
  };
  placa_caminhao: string;
  data_pesagem: string;
  hora_entrada: string;
  hora_saida: string;
  pesagem_inicial: number;
  pesagem_final: number;
  status: string;
}

export default function Relatorios() {
  const { getPesagensCompletas } = useMockApi();
  const [pesagens, setPesagens] = useState<PesagemCompleta[]>([]);
  const [filtradas, setFiltradas] = useState<PesagemCompleta[]>([]);
  const [busca, setBusca] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarPesagens = async () => {
      setLoading(true);
      try {
        const dados = await getPesagensCompletas();
        setPesagens(dados);
        setFiltradas(dados);
      } catch (err) {
        toast.error('Erro ao carregar relatórios');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregarPesagens();
  }, [getPesagensCompletas]);

  useEffect(() => {
    const termo = busca.toLowerCase();
    const resultado = pesagens.filter(
      (p) =>
        p.motorista.nome.toLowerCase().includes(termo) ||
        p.placa_caminhao.toLowerCase().includes(termo) ||
        p.motorista.documento.includes(termo) ||
        p.data_pesagem.includes(termo)
    );
    setFiltradas(resultado);
  }, [busca, pesagens]);

  const calcularDiferenca = (inicial: number, final: number) => {
    return final - inicial;
  };

  const exportarPDF = () => {
    toast.success('Relatório exportado em PDF!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pesando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Descarregando':
        return 'bg-blue-100 text-blue-800';
      case 'Pesagem finalizada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Relatório de Pesagens</h1>
          <p className="text-muted-foreground">
            Visualize todas as pesagens realizadas com informações completas
          </p>
        </div>

        {/* Busca e Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="busca">Buscar por motorista, placa ou data</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Ex: João Silva, ABC-1234, 04/06/2026"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBusca('')}>
                Limpar Filtros
              </Button>
              <Button onClick={exportarPDF} className="ml-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {filtradas.length} pesagem{filtradas.length !== 1 ? 's' : ''} encontrada{filtradas.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {filtradas.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhuma pesagem encontrada com os filtros aplicados
                </p>
              </CardContent>
            </Card>
          ) : (
            filtradas.map((pesagem) => (
              <Card key={pesagem.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandido(expandido === pesagem.id ? null : pesagem.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="pb-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-base">
                            Ticket #{pesagem.id}
                          </CardTitle>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(pesagem.status)}`}>
                            {pesagem.status}
                          </span>
                        </div>
                        <CardDescription>
                          {pesagem.motorista.nome} • {pesagem.placa_caminhao}
                        </CardDescription>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandido === pesagem.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                </button>

                {expandido === pesagem.id && (
                  <CardContent className="pt-0 border-t">
                    <div className="space-y-6 py-4">
                      {/* Informações do Motorista */}
                      <div>
                        <h3 className="font-semibold text-sm mb-3">Informações do Motorista</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Nome</p>
                            <p className="font-medium">{pesagem.motorista.nome}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Documento</p>
                            <p className="font-medium">{pesagem.motorista.documento}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Telefone</p>
                            <p className="font-medium">{pesagem.motorista.telefone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Placa do Caminhão</p>
                            <p className="font-medium">{pesagem.placa_caminhao}</p>
                          </div>
                        </div>
                      </div>

                      {/* Datas e Horários */}
                      <div>
                        <h3 className="font-semibold text-sm mb-3">Datas e Horários</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Data</p>
                            <p className="font-medium">{pesagem.data_pesagem}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Hora Entrada</p>
                            <p className="font-medium">{pesagem.hora_entrada}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Hora Saída</p>
                            <p className="font-medium">{pesagem.hora_saida || 'Pendente'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pesagens */}
                      <div>
                        <h3 className="font-semibold text-sm mb-3">Pesagens</h3>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Peso Inicial</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {pesagem.pesagem_inicial.toFixed(2)} kg
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Peso Final</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {pesagem.pesagem_final.toFixed(2)} kg
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Diferença (Líquido)</p>
                              <p className="text-2xl font-bold text-green-600">
                                {calcularDiferenca(pesagem.pesagem_inicial, pesagem.pesagem_final).toFixed(2)} kg
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
