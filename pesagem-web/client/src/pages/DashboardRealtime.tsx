import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMockApi } from '@/hooks/useMockApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AlertCircle, TrendingUp, Truck, Clock, CheckCircle, Loader2, Bell, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

interface Stats {
  total_pesagens: number;
  pesando: number;
  descarregando: number;
  finalizadas: number;
  tempo_medio_minutos: number;
}

interface ChartData {
  hora: string;
  total: number;
}

export default function DashboardRealtime() {
  const { get } = useMockApi();
  const { isConnected, novaPesagem, pesagemAtualizada } = useWebSocket();
  const [, setLocation] = useLocation();
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertaAtivo, setAlertaAtivo] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [statsData, chartDataResponse] = await Promise.all([
          get<Stats>('/pesagens/stats'),
          get<ChartData[]>('/pesagens/chart-data'),
        ]);
        setStats(statsData);
        setChartData(chartDataResponse || []);
      } catch (err) {
        toast.error('Erro ao carregar dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [get]);

  // Atualizar dados quando nova pesagem chega
  useEffect(() => {
    if (novaPesagem) {
      // Atualizar stats
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total_pesagens: prev.total_pesagens + 1,
          pesando: prev.pesando + 1,
        };
      });

      // Mostrar alerta
      toast.success(`🚚 Nova pesagem: ${novaPesagem.placa_caminhao}`, {
        description: `Peso inicial: ${novaPesagem.pesagem_inicial} kg`,
        duration: 5000,
      });

      // Ativar animação de alerta
      setAlertaAtivo(true);
      setTimeout(() => setAlertaAtivo(false), 3000);

      // Reproduzir som de notificação
      reproduzirSom();
    }
  }, [novaPesagem]);

  // Atualizar dados quando pesagem é atualizada
  useEffect(() => {
    if (pesagemAtualizada) {
      // Recarregar stats
      const recarregarStats = async () => {
        try {
          const statsData = await get<Stats>('/pesagens/stats');
          setStats(statsData);
        } catch (err) {
          console.error('Erro ao recarregar stats:', err);
        }
      };

      recarregarStats();

      // Mostrar alerta de finalização
      if (pesagemAtualizada.status === 'Pesagem finalizada') {
        toast.success('✅ Pesagem finalizada!', {
          duration: 5000,
        });
      }
    }
  }, [pesagemAtualizada, get]);

  // Função para reproduzir som de notificação
  const reproduzirSom = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
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
              <h2 className="text-3xl font-bold text-gray-900">Dashboard em Tempo Real</h2>
              <p className="text-gray-600 mt-1">
                Monitoramento de pesagens do dia
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium text-gray-600">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Alerta visual quando nova pesagem chega */}
      {alertaAtivo && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 flex items-center gap-3 animate-pulse">
          <Bell className="w-6 h-6" />
          <div>
            <p className="font-semibold">🚚 Nova Pesagem Registrada!</p>
            <p className="text-sm opacity-90">Atualizando dashboard...</p>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total de Pesagens */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Total de Pesagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.total_pesagens || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </CardContent>
        </Card>

        {/* Pesando */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pesando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.pesando || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Em andamento</p>
          </CardContent>
        </Card>

        {/* Descarregando */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Descarregando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.descarregando || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Aguardando finalização</p>
          </CardContent>
        </Card>

        {/* Finalizadas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Finalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.finalizadas || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tempo Médio */}
      <Card>
        <CardHeader>
          <CardTitle>Tempo Médio de Permanência</CardTitle>
          <CardDescription>
            Tempo médio que os caminhões ficam no pátio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {stats?.tempo_medio_minutos || 0}
            </div>
            <div className="text-gray-600">
              <p className="text-sm">minutos</p>
              <p className="text-xs text-gray-500 mt-1">
                Média do dia
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pesagens por Hora */}
      <Card>
        <CardHeader>
          <CardTitle>Pesagens por Hora</CardTitle>
          <CardDescription>
            Distribuição de pesagens ao longo do dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="total" 
                  fill="#3b82f6" 
                  name="Pesagens"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma pesagem registrada hoje</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
