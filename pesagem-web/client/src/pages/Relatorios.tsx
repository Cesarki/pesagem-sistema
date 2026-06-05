import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMockApi } from '@/hooks/useMockApi';
import { ChevronDown, Download, Search, FileText, X, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

interface Motorista {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
  placa_caminhao: string;
}

interface PesagemCompleta {
  id: number;
  motorista_id: number;
  placa_caminhao: string;
  data_pesagem: string;
  hora_entrada: string;
  hora_saida?: string;
  pesagem_inicial: number;
  pesagem_final?: number;
  status: string;
  criado_em?: string;
}

const OPCOES_STATUS = ['Pesando', 'Descarregando', 'Pesagem finalizada'];

export default function Relatorios() {
  const { get } = useMockApi();
  const [, setLocation] = useLocation();
  const [pesagens, setPesagens] = useState<PesagemCompleta[]>([]);
  const [filtradas, setFiltradas] = useState<PesagemCompleta[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [busca, setBusca] = useState('');
  const [codigoTicket, setCodigoTicket] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState<string>('');
  const [expandido, setExpandido] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [pesagensData, motoristasData] = await Promise.all([
          get<PesagemCompleta[]>('/pesagens'),
          get<Motorista[]>('/motoristas'),
        ]);
        setPesagens(pesagensData || []);
        setFiltradas(pesagensData || []);
        setMotoristas(motoristasData || []);
      } catch (err) {
        toast.error('Erro ao carregar relatórios');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [get]);

  // Aplicar filtros
  useEffect(() => {
    const termo = busca.toLowerCase();
    const codigo = codigoTicket.trim();
    
    const resultado = pesagens.filter((p) => {
      // Filtro por código do ticket
      if (codigo && !p.id.toString().includes(codigo)) {
        return false;
      }

      // Filtro por status
      if (statusSelecionado && p.status !== statusSelecionado) {
        return false;
      }

      // Filtro por busca geral (motorista, placa, documento, data)
      if (termo) {
        return (
          p.motorista.nome.toLowerCase().includes(termo) ||
          p.placa_caminhao.toLowerCase().includes(termo) ||
          p.motorista.documento.includes(termo) ||
          p.data_pesagem.includes(termo)
        );
      }

      return true;
    });

    setFiltradas(resultado);
  }, [busca, codigoTicket, statusSelecionado, pesagens]);

  const calcularDiferenca = (inicial: number, final: number) => {
    return final - inicial;
  };

  const limparFiltros = () => {
    setBusca('');
    setCodigoTicket('');
    setStatusSelecionado('');
  };

  const exportarRelatorio = () => {
    try {
      if (filtradas.length === 0) {
        toast.error('Nenhuma pesagem para exportar');
        return;
      }

      // Criar conteúdo HTML para o PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Relatório de Pesagens</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              h1 {
                text-align: center;
                color: #1f2937;
                margin-bottom: 30px;
              }
              .relatorio-info {
                background-color: #f3f4f6;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 13px;
              }
              .pesagem-item {
                page-break-inside: avoid;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                background-color: #f9fafb;
              }
              .ticket-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
              }
              .ticket-id {
                font-size: 18px;
                font-weight: bold;
                color: #1f2937;
              }
              .status-badge {
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
              }
              .status-pesando {
                background-color: #fef3c7;
                color: #92400e;
              }
              .status-descarregando {
                background-color: #dbeafe;
                color: #1e40af;
              }
              .status-pesagem-finalizada {
                background-color: #dcfce7;
                color: #166534;
              }
              .section {
                margin-bottom: 15px;
              }
              .section-title {
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 8px;
                font-size: 14px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                font-size: 13px;
              }
              .info-item {
                display: flex;
                flex-direction: column;
              }
              .info-label {
                color: #6b7280;
                font-size: 11px;
                margin-bottom: 3px;
              }
              .info-value {
                color: #1f2937;
                font-weight: 500;
              }
              .pesagens-box {
                background-color: #f3f4f6;
                padding: 12px;
                border-radius: 6px;
                margin-top: 10px;
              }
              .pesagens-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 15px;
                font-size: 13px;
              }
              .peso-item {
                text-align: center;
              }
              .peso-label {
                color: #6b7280;
                font-size: 11px;
                margin-bottom: 5px;
              }
              .peso-valor {
                font-size: 18px;
                font-weight: bold;
              }
              .peso-inicial { color: #2563eb; }
              .peso-final { color: #ea580c; }
              .peso-liquido { color: #16a34a; }
              .footer {
                margin-top: 40px;
                text-align: center;
                color: #9ca3af;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Relatório de Pesagens de Caminhões</h1>
            <div class="relatorio-info">
              <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Total de Pesagens:</strong> ${filtradas.length}</p>
              ${codigoTicket ? `<p><strong>Filtro - Ticket:</strong> #${codigoTicket}</p>` : ''}
              ${statusSelecionado ? `<p><strong>Filtro - Status:</strong> ${statusSelecionado}</p>` : ''}
              ${busca ? `<p><strong>Filtro - Busca:</strong> ${busca}</p>` : ''}
            </div>
      `;

      // Adicionar cada pesagem ao relatório
      let htmlItems = '';
      filtradas.forEach((pesagem) => {
        const motorista = motoristas.find((m) => m.id === pesagem.motorista_id);
        const statusClass = `status-${pesagem.status.toLowerCase().replace(/\s+/g, '-')}`;
        const diferenca = (pesagem.pesagem_final || 0) - pesagem.pesagem_inicial;
        
        htmlItems += `
          <div class="pesagem-item">
            <div class="ticket-header">
              <div class="ticket-id">Ticket #${pesagem.id}</div>
              <div class="status-badge ${statusClass}">${pesagem.status}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Informações do Motorista</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Nome</div>
                  <div class="info-value">${motorista?.nome || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Documento</div>
                  <div class="info-value">${motorista?.documento || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Telefone</div>
                  <div class="info-value">${motorista?.telefone || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Placa do Caminhão</div>
                  <div class="info-value">${pesagem.placa_caminhao}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Datas e Horários</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Data</div>
                  <div class="info-value">${pesagem.data_pesagem}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Hora Entrada</div>
                  <div class="info-value">${pesagem.hora_entrada}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Hora Saída</div>
                  <div class="info-value">${pesagem.hora_saida || 'Pendente'}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Pesagens</div>
              <div class="pesagens-box">
                <div class="pesagens-grid">
                  <div class="peso-item">
                    <div class="peso-label">Peso Inicial</div>
                    <div class="peso-valor peso-inicial">${pesagem.pesagem_inicial.toFixed(2)} kg</div>
                  </div>
                  <div class="peso-item">
                    <div class="peso-label">Peso Final</div>
                    <div class="peso-valor peso-final">${pesagem.pesagem_final.toFixed(2)} kg</div>
                  </div>
                  <div class="peso-item">
                    <div class="peso-label">Diferença (Líquido)</div>
                    <div class="peso-valor peso-liquido">${diferenca.toFixed(2)} kg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      const finalHtml = htmlContent + htmlItems + `
            <div class="footer">
              <p>Sistema de Pesagem de Caminhões</p>
              <p>Relatório gerado automaticamente</p>
            </div>
          </body>
        </html>
      `;

      // Criar blob e fazer download
      const blob = new Blob([finalHtml], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-pesagens-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
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
        {/* Header com Botão de Voltar */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold mb-2">Relatório de Pesagens</h1>
          <p className="text-muted-foreground">
            Visualize todas as pesagens realizadas com informações completas
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca Geral */}
            <div>
              <Label htmlFor="busca">Buscar por motorista, placa, documento ou data</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Ex: João Silva, ABC-1234, 123.456.789-00, 04/06/2026"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros em Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código do Ticket */}
              <div>
                <Label htmlFor="codigo">Código do Ticket</Label>
                <Input
                  id="codigo"
                  placeholder="Ex: 1, 2, 3..."
                  value={codigoTicket}
                  onChange={(e) => setCodigoTicket(e.target.value)}
                  type="number"
                  className="mt-2"
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={statusSelecionado}
                  onChange={(e) => setStatusSelecionado(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Todos os Status</option>
                  {OPCOES_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
              <Button
                onClick={exportarRelatorio}
                className="ml-auto gap-2"
                disabled={filtradas.length === 0}
              >
                <FileText className="h-4 w-4" />
                Exportar Relatório
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
