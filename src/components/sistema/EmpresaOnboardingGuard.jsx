import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/lib/UserContext';
import { base44 } from '@/api/base44Client';

/**
 * Guard que verifica se há empresas cadastradas GLOBALMENTE (não por contexto).
 * Usa list() direto para evitar filtro por group_id/empresa_id que retornaria vazio
 * quando o usuário ainda não foi associado a um grupo.
 * Redireciona para /EmpresaOnboarding apenas se NENHUMA empresa existir no sistema.
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
        // Busca global sem filtro de contexto — apenas para saber se é first-time setup
        const res = await base44.entities.Empresa.list('-updated_date', 1);
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