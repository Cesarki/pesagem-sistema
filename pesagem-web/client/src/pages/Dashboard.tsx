import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Sistema1 from './Sistema1';
import Sistema2 from './Sistema2';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sistema1' | 'sistema2'>('sistema1');

  // Redirecionar para o sistema apropriado baseado no role
  useEffect(() => {
    if (user?.role === 'porteiro') {
      setActiveTab('sistema1');
    } else if (user?.role === 'balanceiro') {
      setActiveTab('sistema2');
    }
  }, [user?.role]);

  // Mostrar mensagem de acesso negado se tentar acessar sistema não autorizado
  const isUnauthorized =
    (user?.role === 'porteiro' && activeTab === 'sistema2') ||
    (user?.role === 'balanceiro' && activeTab === 'sistema1');

  if (isUnauthorized) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              {user?.role === 'porteiro'
                ? 'Porteiros só podem acessar o Sistema 1 (Entrada)'
                : 'Balanceiros só podem acessar o Sistema 2 (Saída)'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'sistema1' ? <Sistema1 /> : <Sistema2 />}
    </DashboardLayout>
  );
}
