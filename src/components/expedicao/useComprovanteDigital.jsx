import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import usePermissions from '@/components/lib/usePermissions';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { idbGet } from '@/components/lib/useIndexedDBCache';
import { chaveComprovante, guardarComprovante, enviarComprovantePendente } from '@/components/expedicao/comprovanteDigitalStorage';

export default function useComprovanteDigital({ entrega, readOnly, onSuccess, onOffline }) {
  const { user } = useUser(); const { hasPermission } = usePermissions(); const client = useQueryClient();
  const { grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const [erro, setErro] = useState(''); const [enviando, setEnviando] = useState(false);
  const [localizacao, setLocalizacao] = useState(null);
  useEffect(() => { if (!readOnly && navigator.geolocation) navigator.geolocation.getCurrentPosition((p) => setLocalizacao({ latitude_entrega: p.coords.latitude, longitude_entrega: p.coords.longitude }), () => {}, { timeout: 5000 }); }, [readOnly]);
  const contextoValido = Boolean(entrega?.group_id && entrega?.empresa_id && grupoAtual?.id === entrega.group_id && (contexto === 'grupo' || empresaAtual?.id === entrega.empresa_id));
  const permitido = contextoValido && hasPermission('Expedição', 'Entrega', readOnly ? 'ver' : 'editar');
  const consulta = useQuery({
    queryKey: ['comprovante-entrega', user?.id, entrega?.group_id, entrega?.empresa_id, entrega?.id], enabled: Boolean(readOnly && permitido),
    queryFn: async () => (await base44.functions.invoke('onEntregaUpdated', { acao: 'consultar_comprovante', entrega_id: entrega.id, group_id: entrega.group_id, empresa_id: entrega.empresa_id })).data,
    staleTime: 240000, refetchOnWindowFocus: false, retry: false,
  });
  useEffect(() => {
    if (!readOnly || !permitido) return undefined;
    return base44.entities.Entrega.subscribe((evento) => { if (evento.id === entrega.id) consulta.refetch(); });
  }, [readOnly, permitido, entrega?.id]);
  const salvar = async ({ dados, arquivos, assinatura, revisado, itens }) => {
    setErro('');
    if (!permitido || !user?.id) { setErro('Sem permissão ou contexto de grupo/empresa inválido.'); return; }
    setEnviando(true);
    try {
      // §23 — o que foi entregue é registrado antes do comprovante, limitado pelo saldo oficial no servidor.
      if (Array.isArray(itens) && itens.length) {
        if (!navigator.onLine) throw new Error('Sem conexão: os itens entregues precisam ser registrados antes do comprovante.');
        await base44.functions.invoke('onEntregaUpdated', { acao: 'registrar_itens_entrega', entrega_id: entrega.id, group_id: entrega.group_id, empresa_id: entrega.empresa_id, itens });
        await client.invalidateQueries({ predicate: (q) => ['saldos-itens-pedido', 'itens-entrega'].some((k) => q.queryKey.includes(k)) });
      }
      const chave = chaveComprovante(user.id, entrega);
      const anterior = await idbGet(chave);
      const operacao = anterior?.body?.versao === entrega.updated_date ? anterior.body.operacao_id : crypto.randomUUID();
      const body = { acao: 'registrar_comprovante', entrega_id: entrega.id, group_id: entrega.group_id, empresa_id: entrega.empresa_id, versao: entrega.updated_date, operacao_id: operacao, revisado, comprovante: { ...dados, ...localizacao, data_hora_recebimento: new Date().toISOString() } };
      const blob = await new Promise((resolve) => assinatura.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Não foi possível preparar a assinatura.');
      await guardarComprovante(chave, { userId: user.id, body, arquivos: { ...arquivos, assinatura_digital: new File([blob], 'assinatura.png', { type: 'image/png' }) } });
      if (!navigator.onLine) {
        if (!onOffline) throw new Error('Sem conexão. O comprovante está guardado neste dispositivo; mantenha o formulário aberto e tente novamente ao reconectar.');
        onOffline(chave); return;
      }
      await enviarComprovantePendente(chave, user.id);
      await client.invalidateQueries({ predicate: (q) => ['Entrega', 'entregas', 'entregas-motorista', 'comprovante-entrega'].some((k) => q.queryKey.includes(k)) });
      onSuccess?.();
    } catch (e) { setErro(e.response?.data?.error || e.message || 'Não foi possível registrar o comprovante.'); }
    finally { setEnviando(false); }
  };
  return { permitido, erro, enviando, salvar, consulta };
}