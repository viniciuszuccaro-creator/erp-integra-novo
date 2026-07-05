import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Guard que verifica se há empresas cadastradas.
 * Deve ser usado DENTRO do Layout (onde UserProvider existe).
 * Redireciona para /EmpresaOnboarding se nenhuma empresa encontrada.
 */
export default function EmpresaOnboardingGuard({ children }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const { filterInContext } = useContextoVisual();

  useEffect(() => {
    if (!user?.id) { setChecked(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await filterInContext('Empresa', {}, '-updated_date', 5);
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

  // Always render children to keep a stable DOM anchor for Suspense boundaries.
  // Swapping between a spinner div and children causes React's removeChild/insertBefore errors.
  return children;
}