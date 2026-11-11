import { base44 } from '@/api/base44Client';
import { idbGet, idbSet, idbDelete } from '@/components/lib/useIndexedDBCache';

export const ARQUIVOS_COMPROVANTE = [
  { campo: 'foto_comprovante', label: 'Foto do canhoto' },
  { campo: 'foto_mercadoria', label: 'Foto da mercadoria' },
  { campo: 'foto_local', label: 'Foto do local de entrega' },
];
const CAMPOS = [...ARQUIVOS_COMPROVANTE.map(({ campo }) => campo), 'assinatura_digital'];
export const chaveComprovante = (userId, entrega) => `comprovante:${userId}:${entrega.group_id}:${entrega.empresa_id}:${entrega.id}`;

export async function guardarComprovante(chave, dados) {
  if (!await idbSet(chave, dados, 7 * 86400000)) throw new Error('Não foi possível guardar o comprovante neste dispositivo. Não feche o formulário.');
}

export async function enviarComprovantePendente(chave, userId, versaoInicio) {
  const pendente = await idbGet(chave);
  if (!pendente || pendente.userId !== userId) throw new Error('Comprovante pendente não disponível para este usuário.');
  const { body, arquivos } = pendente;
  if (versaoInicio) { body.versao = versaoInicio; await guardarComprovante(chave, pendente); }
  // Guarda cada URI obtida para que uma falha de conexão não exija reenviar as fotos já recebidas.
  for (const campo of CAMPOS) {
    if (body.comprovante[campo]) continue;
    const file = arquivos[campo];
    if (!(file instanceof Blob)) throw new Error('Arquivo do comprovante não encontrado. Abra novamente a entrega.');
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    body.comprovante[campo] = file_uri;
    await guardarComprovante(chave, pendente);
  }
  const response = await base44.functions.invoke('onEntregaUpdated', body);
  if (!response.data?.ok) throw new Error(response.data?.error || 'Não foi possível confirmar a entrega.');
  await idbDelete(chave);
  return response.data;
}