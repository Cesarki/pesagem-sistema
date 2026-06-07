import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMockApi } from '@/hooks/useMockApi';
import { ArrowLeft, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
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

export default function CadastroMotorista() {
  const { get, post, put, delete: delete_, isLoading } = useMockApi();
  const [, setLocation] = useLocation();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    placa_caminhao: '',
  });

  // Carregar motoristas
  useEffect(() => {
    const carregarMotoristas = async () => {
      setLoading(true);
      try {
        const dados = await get<Motorista[]>('/motoristas');
        setMotoristas(dados);
      } catch (err) {
        toast.error('Erro ao carregar motoristas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    carregarMotoristas();
  }, [get]);

  const limparFormulario = () => {
    setFormData({
      nome: '',
      documento: '',
      telefone: '',
      placa_caminhao: '',
    });
    setEditandoId(null);
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do motorista é obrigatório');
      return false;
    }
    if (!formData.documento.trim()) {
      toast.error('Documento é obrigatório');
      return false;
    }
    if (!formData.telefone.trim()) {
      toast.error('Telefone é obrigatório');
      return false;
    }
    if (!formData.placa_caminhao.trim()) {
      toast.error('Placa do caminhão é obrigatória');
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    try {
      if (editandoId) {
        // Atualizar motorista existente
        await put<Motorista>(`/motoristas/${editandoId}`, formData);
        setMotoristas((prev) =>
          prev.map((m) => (m.id === editandoId ? { ...m, ...formData } : m))
        );
        toast.success('Motorista atualizado com sucesso!');
      } else {
        // Criar novo motorista
        const novoMotorista = await post<Motorista>('/motoristas', formData);
        setMotoristas((prev) => [novoMotorista, ...prev]);
        toast.success('Motorista cadastrado com sucesso!');
      }
      limparFormulario();
    } catch (err) {
      toast.error(editandoId ? 'Erro ao atualizar motorista' : 'Erro ao cadastrar motorista');
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (motorista: Motorista) => {
    setFormData({
      nome: motorista.nome,
      documento: motorista.documento,
      telefone: motorista.telefone,
      placa_caminhao: motorista.placa_caminhao,
    });
    setEditandoId(motorista.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletar = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este motorista?')) {
      try {
        await delete_<Motorista>(`/motoristas/${id}`);
        setMotoristas((prev) => prev.filter((m) => m.id !== id));
        toast.success('Motorista deletado com sucesso!');
      } catch (err) {
        toast.error('Erro ao deletar motorista');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Carregando motoristas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663244773232/Rgzxra4LNMDNT6nWWKya48/classic-metais-logo-D7ppsyc7uAzvR8rNhLmqUX.webp" 
              alt="Classic Metais Reciclados" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-bold mb-1">Cadastro de Motoristas</h1>
              <p className="text-muted-foreground">
                Gerencie motoristas e suas placas de caminhão
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {editandoId ? 'Editar Motorista' : 'Novo Motorista'}
            </CardTitle>
            <CardDescription>
              {editandoId
                ? 'Atualize as informações do motorista'
                : 'Preencha os dados para cadastrar um novo motorista'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Motorista *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: João Silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  disabled={salvando}
                />
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label htmlFor="documento">Documento (CPF/CNPJ) *</Label>
                <Input
                  id="documento"
                  placeholder="Ex: 123.456.789-00"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  disabled={salvando}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="Ex: (11) 98765-4321"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  disabled={salvando}
                />
              </div>

              {/* Placa do Caminhão */}
              <div className="space-y-2">
                <Label htmlFor="placa">Placa do Caminhão *</Label>
                <Input
                  id="placa"
                  placeholder="Ex: ABC-1234"
                  value={formData.placa_caminhao}
                  onChange={(e) => setFormData({ ...formData, placa_caminhao: e.target.value })}
                  disabled={salvando}
                  maxLength={8}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              {editandoId && (
                <Button
                  variant="outline"
                  onClick={limparFormulario}
                  disabled={salvando}
                >
                  Cancelar Edição
                </Button>
              )}
              <Button
                onClick={handleSalvar}
                disabled={salvando}
                className="ml-auto gap-2"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {editandoId ? 'Atualizar' : 'Cadastrar'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Motoristas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Motoristas Cadastrados</CardTitle>
            <CardDescription>
              Total de {motoristas.length} motorista{motoristas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {motoristas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum motorista cadastrado</p>
                <p className="text-sm text-muted-foreground">
                  Comece adicionando um novo motorista usando o formulário acima
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {motoristas.map((motorista) => (
                  <div
                    key={motorista.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {motorista.nome}
                          </h3>
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                            {motorista.placa_caminhao}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="text-xs font-medium text-foreground">Documento</p>
                            <p>{motorista.documento}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">Telefone</p>
                            <p>{motorista.telefone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditar(motorista)}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletar(motorista.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
