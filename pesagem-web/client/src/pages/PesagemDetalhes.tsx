import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMockApi } from '@/hooks/useMockApi';
import { AlertCircle, ArrowLeft, Download, Loader2, Clock, Weight, Truck, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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
  atualizado_em?: string;
}

interface Motorista {
  id: number;
  nome: string;
  documento: string;
  telefone: string;
}

export default function PesagemDetalhes() {
  const [, params] = useRoute('/pesagem/:id');
  const [, setLocation] = useLocation();
  const { get } = useMockApi();

  const [pesagem, setPesagem] = useState<Pesagem | null>(null);
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);

  const pesagemId = params?.id;

  useEffect(() => {
    const loadPesagem = async () => {
      if (!pesagemId) return;

      setLoading(true);
      try {
        const pesagensData = await get<Pesagem[]>('/pesagens');
        const pesagemEncontrada = pesagensData?.find((p) => p.id === parseInt(pesagemId));

        if (!pesagemEncontrada) {
          toast.error('Pesagem não encontrada');
          setLocation('/dashboard');
          return;
        }

        setPesagem(pesagemEncontrada);

        // Carregar motorista
        const motoristasData = await get<Motorista[]>('/motoristas');
        const motoristaEncontrado = motoristasData?.find(
          (m) => m.id === pesagemEncontrada.motorista_id
        );
        setMotorista(motoristaEncontrado || null);
      } catch (err) {
        toast.error('Erro ao carregar pesagem');
        setLocation('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadPesagem();
  }, [pesagemId, get, setLocation]);

  const calcularTempoDecorrido = () => {
    if (!pesagem) return 0;

    const entrada = new Date(pesagem.criado_em);
    const saida = pesagem.atualizado_em ? new Date(pesagem.atualizado_em) : new Date();

    const diferenca = saida.getTime() - entrada.getTime();
    const minutos = Math.floor(diferenca / 60000);

    return minutos;
  };

  const calcularDiferenca = () => {
    if (!pesagem || !pesagem.pesagem_final) return 0;
    return pesagem.pesagem_final - pesagem.pesagem_inicial;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pesagem finalizada':
        return 'bg-green-100 text-green-800';
      case 'Descarregando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pesando':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const gerarPDF = () => {
    if (!pesagem || !motorista) return;

    const logoUrl = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663244773232/Rgzxra4LNMDNT6nWWKya48/classic-metais-logo-D7ppsyc7uAzvR8rNhLmqUX.webp';
    const tempoDecorrido = calcularTempoDecorrido();
    const diferenca = calcularDiferenca();
    const statusClass = `status-${pesagem.status.toLowerCase().replace(/\s+/g, '-')}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pesagem #${pesagem.id} - Classic Metais Reciclados</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              background-color: #fff;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #1a5f3f;
            }
            .logo {
              width: 100px;
              height: 100px;
            }
            .company-info {
              text-align: center;
              flex: 1;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #1a5f3f;
              margin: 0;
            }
            .company-subtitle {
              font-size: 14px;
              color: #666;
              margin: 5px 0 0 0;
            }
            h1 {
              text-align: center;
              color: #1f2937;
              margin: 20px 0 30px 0;
              font-size: 22px;
            }
            .ticket-info {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              font-size: 13px;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-top: 10px;
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
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .section-title {
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 12px;
              font-size: 14px;
              border-bottom: 2px solid #1a5f3f;
              padding-bottom: 8px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
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
              font-weight: bold;
            }
            .info-value {
              color: #1f2937;
              font-weight: 500;
            }
            .pesos-box {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin-top: 10px;
            }
            .pesos-grid {
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
            .alerta {
              background-color: #fee2e2;
              border: 1px solid #fecaca;
              border-radius: 6px;
              padding: 12px;
              margin-top: 10px;
              font-size: 12px;
              color: #991b1b;
            }
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
          <div class="header">
            <img src="${logoUrl}" alt="Classic Metais Reciclados" class="logo" />
            <div class="company-info">
              <p class="company-name">CLASSIC METAIS RECICLADOS</p>
              <p class="company-subtitle">Sistema de Pesagem de Caminhões</p>
            </div>
          </div>
          
          <h1>Detalhes da Pesagem #${pesagem.id}</h1>
          
          <div class="ticket-info">
            <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${pesagem.status}</span></p>
          </div>
          
          <div class="section">
            <div class="section-title">Informações do Motorista</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nome</div>
                <div class="info-value">${motorista.nome}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Documento</div>
                <div class="info-value">${motorista.documento}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Telefone</div>
                <div class="info-value">${motorista.telefone}</div>
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
                <div class="info-label">Data da Pesagem</div>
                <div class="info-value">${formatDate(pesagem.data_pesagem)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Hora de Entrada</div>
                <div class="info-value">${pesagem.hora_entrada}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Hora de Saída</div>
                <div class="info-value">${pesagem.hora_saida || 'Pendente'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Tempo Total</div>
                <div class="info-value">${tempoDecorrido} min</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Pesagens</div>
            <div class="pesos-box">
              <div class="pesos-grid">
                <div class="peso-item">
                  <div class="peso-label">Peso Inicial</div>
                  <div class="peso-valor peso-inicial">${parseFloat(String(pesagem.pesagem_inicial)).toFixed(2)} kg</div>
                </div>
                <div class="peso-item">
                  <div class="peso-label">Peso Final</div>
                  <div class="peso-valor peso-final">${parseFloat(String(pesagem.pesagem_final || 0)).toFixed(2)} kg</div>
                </div>
                <div class="peso-item">
                  <div class="peso-label">Diferença (Líquido)</div>
                  <div class="peso-valor peso-liquido">${parseFloat(String(diferenca)).toFixed(2)} kg</div>
                </div>
              </div>
            </div>
            ${diferenca > 0 ? `
              <div class="alerta">
                <strong>⚠️ Atenção!</strong> Este caminhão saiu com peso maior do que quando chegou. Diferença: +${parseFloat(String(diferenca)).toFixed(2)} kg
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Sistema de Pesagem de Caminhões</p>
            <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;

    // Criar blob e fazer download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pesagem-${pesagem.id}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('PDF gerado com sucesso!');
  };

  const chartData = [
    {
      nome: 'Entrada',
      peso: pesagem?.pesagem_inicial || 0,
      fill: '#3b82f6',
    },
    {
      nome: 'Saída',
      peso: pesagem?.pesagem_final || 0,
      fill: '#ef4444',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pesagem) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-gray-500">Pesagem não encontrada</p>
      </div>
    );
  }

  const tempoDecorrido = calcularTempoDecorrido();
  const diferenca = calcularDiferenca();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663244773232/Rgzxra4LNMDNT6nWWKya48/classic-metais-logo-D7ppsyc7uAzvR8rNhLmqUX.webp" 
              alt="Classic Metais Reciclados" 
              className="w-12 h-12"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Detalhes da Pesagem</h2>
              <p className="text-gray-600 mt-1">ID: {pesagem.id}</p>
            </div>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(pesagem.status)}`}>
          {pesagem.status}
        </div>
      </div>

      {/* Informações do Motorista e Caminhão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Motorista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Motorista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-semibold text-gray-900">{motorista?.nome || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Documento</p>
              <p className="font-semibold text-gray-900">{motorista?.documento || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-semibold text-gray-900">{motorista?.telefone || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Caminhão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Informações do Caminhão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Placa</p>
              <p className="font-semibold text-gray-900 text-lg">{pesagem.placa_caminhao}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data da Pesagem</p>
              <p className="font-semibold text-gray-900">{formatDate(pesagem.data_pesagem)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hora de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{pesagem.hora_entrada}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(pesagem.criado_em).toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hora de Saída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {pesagem.hora_saida || (pesagem.status === 'Pesagem finalizada' ? '✓' : '-')}
            </p>
            {pesagem.atualizado_em && (
              <p className="text-xs text-gray-500 mt-1">{new Date(pesagem.atualizado_em).toLocaleString('pt-BR')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{tempoDecorrido}</p>
            <p className="text-xs text-gray-500 mt-1">minutos</p>
          </CardContent>
        </Card>
      </div>

      {/* Pesos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Peso Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{pesagem.pesagem_inicial}</p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Peso Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{pesagem.pesagem_final || '-'}</p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Diferença
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${diferenca > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {diferenca > 0 ? '+' : ''}{diferenca}
            </p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Comparação */}
      {pesagem.pesagem_final && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Pesos</CardTitle>
            <CardDescription>Entrada vs Saída</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="peso" name="Peso (kg)" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Alerta se peso final > peso inicial */}
      {pesagem.pesagem_final && diferenca > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">Atenção!</p>
            <p className="text-sm text-red-700">
              Este caminhão saiu com peso maior do que quando chegou. Diferença: +{diferenca} kg
            </p>
          </div>
        </div>
      )}

      {/* Botão de Download */}
      <div className="flex justify-center">
        <Button className="gap-2" onClick={gerarPDF}>
          <Download className="w-4 h-4" />
          Gerar PDF
        </Button>
      </div>
    </div>
  );
}
