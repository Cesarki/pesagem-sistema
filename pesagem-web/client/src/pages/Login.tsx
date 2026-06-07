import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function Login() {
  const [email, setEmail] = useState('porteiro@pesagem.com');
  const [senha, setSenha] = useState('123456');
  const [, setLocation] = useLocation();
  const { login, isLoading, error, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, senha);
    } catch (err) {
      // Erro já é tratado no contexto
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663244773232/Rgzxra4LNMDNT6nWWKya48/classic-metais-logo-D7ppsyc7uAzvR8rNhLmqUX.webp" 
              alt="Classic Metais Reciclados" 
              className="w-24 h-24"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Classic Metais Reciclados</h1>
          <p className="text-gray-600">Sistema de Pesagem de Caminhões</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Fazer Login</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <p className="font-semibold mb-2">Credenciais de Teste:</p>
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold text-blue-900">Porteiro (Sistema 1):</p>
                    <p>Email: porteiro@pesagem.com</p>
                    <p>Senha: 123456</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-semibold text-blue-900">Balanceiro (Sistema 2):</p>
                    <p>Email: balanceiro@pesagem.com</p>
                    <p>Senha: 123456</p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
