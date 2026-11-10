// Preferências por usuário da Central 360° — larguras de colunas, ordenação, filtros e largura do painel
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/components/lib/UserContext';

const PADRAO = {
  larguras: {},
  ordenacao: { campo: 'data', direcao: 'desc' },
  filtros: { vendedor: 'todos', cidade: 'todos', origem: 'todos' },
  larguraPainel: 360,
};

const chaveStorage = (userId) => `central360:pref:${userId || 'anon'}`;

export default function usePreferenciasCentral360() {
  const { user } = useUser();
  const chave = chaveStorage(user?.id);
  const [preferencias, setPreferencias] = useState(PADRAO);

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(chave) || 'null');
      if (!salvo) { setPreferencias(PADRAO); return; }
      setPreferencias({
        ...PADRAO,
        ...salvo,
        larguras: salvo.larguras || {},
        filtros: { ...PADRAO.filtros, ...(salvo.filtros || {}) },
        ordenacao: salvo.ordenacao || PADRAO.ordenacao,
      });
    } catch {
      setPreferencias(PADRAO);
    }
  }, [chave]);

  const persistir = useCallback((proximo) => {
    setPreferencias(proximo);
    try {
      localStorage.setItem(chave, JSON.stringify(proximo));
    } catch (erro) {
      console.warn('Preferências da Central 360 não puderam ser salvas:', erro);
    }
  }, [chave]);

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