import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';

/**
 * Guard que verifica se há empresas cadastradas.
 * Deve ser usado DENTRO do Layout (onde UserProvider existe).
 * Redireciona para /EmpresaOnboarding se nenhuma empresa encontrada.
 */
export default function EmpresaOnboardingGuard({ children }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user?.id) { setChecked(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.entities.Empresa.list('-updated_date', 5);
        if (!cancelled && (!res || res.length === 0)) {
          navigate('/EmpresaOnboarding');
        }
      } catch {
        // Em caso de erro, não bloquear
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, navigate]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return children;
}