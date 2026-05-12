import React, { useEffect, useState } from 'react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, AlertTriangle } from 'lucide-react';

/**
 * Guard que redireciona para onboarding se:
 * 1. Não há empresa cadastrada no sistema OU
 * 2. Usuário não tem empresa selecionada (contexto nulo) em modo empresa
 */
export default function EmpresaSelectorGuard({ children }) {
  const { empresaAtual, contexto } = useContextoVisual();
  const navigate = useNavigate();
  const [empresasCadastradas, setEmpresasCadastradas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const todas = await base44.entities.Empresa.list('-updated_date', 100);
        if (!cancelled) {
          setEmpresasCadastradas(todas || []);
          // Se não há empresas cadastradas, redirecionar para onboarding
          if (!todas || todas.length === 0) {
            navigate('/EmpresaOnboarding');
          }
        }
      } catch {
        if (!cancelled) setEmpresasCadastradas([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  // Se está em modo empresa e não há empresa selecionada, mostrar seletor
  if (!loading && contexto !== 'grupo' && !empresaAtual?.id) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-2 border-amber-200">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Empresa não selecionada</h2>
            <p className="text-sm text-slate-600">
              Selecione uma empresa no menu superior para continuar, ou crie uma nova.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              O sistema requer uma empresa ativa para acessar os módulos de negócio.
            </div>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se está carregando, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return children;
}