// Preferências da Central 360° — persistidas no registro do usuário (larguras, ordenação, filtros, painel)
// O armazenamento local permanece apenas como cache imediato de leitura.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';

const PADRAO = {
  larguras: {},
  ordenacao: { campo: 'data', direcao: 'desc' },
  filtros: { vendedor: 'todos', cidade: 'todos', origem: 'todos' },
  larguraPainel: 360,
};

const ESPERA_SALVAR_MS = 900;

const chaveStorage = (userId) => `central360:pref:${userId || 'anon'}`;

const normalizar = (salvo) => {
  if (!salvo || typeof salvo !== 'object') return PADRAO;
  return {
    ...PADRAO,
    ...salvo,
    larguras: salvo.larguras || {},
    filtros: { ...PADRAO.filtros, ...(salvo.filtros || {}) },
    ordenacao: salvo.ordenacao || PADRAO.ordenacao,
  };
};

export default function usePreferenciasCentral360() {
  const { user } = useUser();
  const chave = chaveStorage(user?.id);
  const prefsDoUsuario = user?.data?.central360_prefs || user?.central360_prefs || null;

  const [preferencias, setPreferencias] = useState(PADRAO);
  const timer = useRef(null);

  // O registro do usuário tem prioridade; o local só evita a tela em branco enquanto carrega
  useEffect(() => {
    let local = null;
    try {
      local = JSON.parse(localStorage.getItem(chave) || 'null');
    } catch {
      local = null;
    }
    setPreferencias(normalizar(prefsDoUsuario || local));
  }, [chave, prefsDoUsuario]);

  const persistir = useCallback((proximo) => {
    setPreferencias(proximo);
    try {
      localStorage.setItem(chave, JSON.stringify(proximo));
    } catch (erro) {
      console.warn('Preferências da Central 360 não puderam ser armazenadas localmente:', erro);
    }

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      base44.auth.updateMe({ central360_prefs: proximo }).catch((erro) => {
        console.warn('Preferências da Central 360 não puderam ser salvas no usuário:', erro);
      });
    }, ESPERA_SALVAR_MS);
  }, [chave]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return useMemo(() => ({
    larguras: preferencias.larguras,
    ordenacao: preferencias.ordenacao,
    filtros: preferencias.filtros,
    larguraPainel: preferencias.larguraPainel,
    setLargura: (id, px) => persistir({
      ...preferencias,
      larguras: { ...preferencias.larguras, [id]: px },
    }),
    setOrdenacao: (ordenacao) => persistir({ ...preferencias, ordenacao }),
    setFiltro: (campo, valor) => persistir({
      ...preferencias,
      filtros: { ...preferencias.filtros, [campo]: valor },
    }),
    limparFiltros: () => persistir({ ...preferencias, filtros: PADRAO.filtros }),
    setLarguraPainel: (px) => persistir({ ...preferencias, larguraPainel: px }),
  }), [preferencias, persistir]);
}