// Recuperação da edição da mesa, reutilizando o cache existente; não confirma nem fecha vendas offline.
import { useEffect, useRef, useState } from 'react';
import { idbGet, idbSet, idbDelete } from '@/components/lib/useIndexedDBCache';

export default function useRascunhoNegociacao({ chave, habilitado, sujo, itens, dados, versao }) {
  const [pronto, setPronto] = useState(null);
  const [pendente, setPendente] = useState(null);
  const [estado, setEstado] = useState('');
  const ignorar = useRef(false);
  useEffect(() => {
    if (!habilitado || !chave) return;
    let ativo = true;
    setPronto(null);
    setPendente(null);
    idbGet(chave).then((salvo) => {
      if (!ativo) return;
      if (salvo && Array.isArray(salvo.itens)) setPendente(salvo);
      setPronto(chave);
    });
    return () => { ativo = false; };
  }, [chave, habilitado]);
  useEffect(() => {
    if (!habilitado || pronto !== chave || pendente || !sujo) return;
    let ativo = true;
    ignorar.current = false;
    const snapshot = { itens, dados, versao, salvo_em: new Date().toISOString() };
    const salvar = async () => {
      if (ignorar.current) return;
      const ok = await idbSet(chave, snapshot, 7 * 86400000);
      if (ativo) setEstado(ok ? 'Rascunho local salvo, ainda não sincronizado' : 'Não foi possível guardar o rascunho neste dispositivo');
    };
    setEstado('Guardando rascunho local…');
    const timer = setTimeout(salvar, 600);
    const guardarAoSair = () => { void salvar(); };
    window.addEventListener('pagehide', guardarAoSair);
    return () => { ativo = false; clearTimeout(timer); window.removeEventListener('pagehide', guardarAoSair); if (!ignorar.current) void idbSet(chave, snapshot, 7 * 86400000); };
  }, [chave, habilitado, pronto, pendente, sujo, itens, dados, versao]);
  const limpar = async () => {
    ignorar.current = true;
    const ok = chave ? await idbDelete(chave) : false;
    setPendente(null);
    setEstado(ok ? '' : 'Não foi possível remover o rascunho local');
  };
  return { pendente, estado, carregando: habilitado && pronto !== chave, recuperar: () => setPendente(null), limpar };
}