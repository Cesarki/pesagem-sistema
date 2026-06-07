import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, LogOut, Menu, Truck, Users, X, Activity } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useLocation } from 'wouter';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: 'sistema1' | 'sistema2';
  onTabChange: (tab: 'sistema1' | 'sistema2') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const role = user?.role;

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  // Determinar qual sistema o usuário pode acessar
  const canAccessSistema1 = role === 'porteiro' || role === 'admin';
  const canAccessSistema2 = role === 'balanceiro' || role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663244773232/Rgzxra4LNMDNT6nWWKya48/classic-metais-logo-D7ppsyc7uAzvR8rNhLmqUX.webp" 
                alt="Classic Metais Reciclados" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-sm font-bold text-gray-900">Classic Metais</h1>
                <p className="text-xs text-gray-600">Pesagem</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex gap-2">
                {canAccessSistema1 && (
                  <Button
                    variant={activeTab === 'sistema1' ? 'default' : 'outline'}
                    onClick={() => onTabChange('sistema1')}
                    className="gap-2"
                  >
                    <span>Sistema 1</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Entrada
                    </span>
                  </Button>
                )}
                {canAccessSistema2 && (
                  <Button
                    variant={activeTab === 'sistema2' ? 'default' : 'outline'}
                    onClick={() => onTabChange('sistema2')}
                    className="gap-2"
                  >
                    <span>Sistema 2</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Saída
                    </span>
                  </Button>
                )}
                {canAccessSistema1 && (
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/dashboard-realtime')}
                    className="gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setLocation('/relatorios')}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Relatórios</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/cadastro-motorista')}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Motoristas</span>
                </Button>
              </div>

              <div className="border-l border-gray-200 pl-4 flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3 border-t border-gray-200 pt-4">
              {canAccessSistema1 && (
                <Button
                  variant={activeTab === 'sistema1' ? 'default' : 'outline'}
                  onClick={() => {
                    onTabChange('sistema1');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Sistema 1 - Entrada
                </Button>
              )}
              {canAccessSistema2 && (
                <Button
                  variant={activeTab === 'sistema2' ? 'default' : 'outline'}
                  onClick={() => {
                    onTabChange('sistema2');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Sistema 2 - Saída
                </Button>
              )}
              {canAccessSistema1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocation('/dashboard-realtime');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Dashboard em Tempo Real
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setLocation('/relatorios');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setLocation('/cadastro-motorista');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Motoristas
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
