import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Target, TrendingUp } from "lucide-react";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";
import { Badge } from "@/components/ui/badge";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * V21.1.2: Oportunidade Form - Adaptado para Window Mode
 */
export default function OportunidadeForm({ oportunidade, onSubmit, onSuccess, windowMode = false }) {
  const { createInContext, updateInContext } = useContextoVisual();
  const { canCreate, canEdit } = usePermissions();
  const { user } = useUser();
  const { data: clientes = [] } = useRLSQuery('Cliente', {}, '-created_date', 9999);
  const { data: origens = [] } = useRLSQuery('ParametroOrigemPedido', { ativo: true }, '-updated_date', 100);
  const { data: representantes = [] } = useRLSQuery('Representante', {}, '-updated_date', 9999);

  const [formData, setFormData] = useState(oportunidade || {
    titulo: '',
    descricao: '',
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    origem: 'Site',
    responsavel: '',
    etapa: 'Prospecção',
    valor_estimado: 0,
    probabilidade: 50,
    temperatura: 'Morno',
    data_abertura: new Date().toISOString().split('T')[0],
    data_previsao: '',
    produtos_interesse: [],
    necessidades: '',
    orcamento_cliente: 0,
    proxima_acao: '',
    data_proxima_acao: '',
    observacoes: '',
    status: 'Aberto'
  });

  const schema = z.object({
    titulo: z.string().min(1, 'Título é obrigatório'),
    cliente_nome: z.string().min(1, 'Cliente é obrigatório'),
  });

  const podeSalvar = oportunidade ? canEdit('CRM') : canCreate('CRM');

  // Regra-Mãe 5: persistência própria com validação dupla RBAC + contexto (fail-closed).
  // Corrige fluxo quebrado: o formulário chamava um "onSubmit" que a listagem nunca passava (salvar não persistia).
  const handleSubmit = async (dados) => {
    if (!podeSalvar) throw new Error('Sem permissão para salvar oportunidades.');
    // Fluxos legados (ex.: Ações Rápidas) persistem via onSubmit próprio — delega para evitar duplicação
    if (typeof onSubmit === 'function') { await onSubmit(dados); return; }
    if (!dados?.group_id) throw new Error('Sem contexto de grupo/empresa — operação bloqueada.');
    const salvou = oportunidade
      ? await updateInContext('Oportunidade', oportunidade.id, dados)
      : await createInContext('Oportunidade', dados);
    try {
      await base44.entities.AuditLog.create({
        acao: oportunidade ? 'Edição' : 'Criação', modulo: 'CRM', entidade: 'Oportunidade', registro_id: salvou?.id,
        group_id: salvou?.group_id, empresa_id: salvou?.empresa_id,
        usuario: user?.full_name || user?.email || 'Sistema', usuario_id: user?.id,
        descricao: `Oportunidade "${dados.titulo}" ${oportunidade ? 'atualizada' : 'criada'} via formulário`,
        ...(oportunidade ? { dados_anteriores: { etapa: oportunidade.etapa, status: oportunidade.status, valor_estimado: oportunidade.valor_estimado } } : {}),
        dados_novos: salvou,
        data_hora: new Date().toISOString(), sucesso: true
      });
    } catch (_) { console.error('[crm] falha ao auditar oportunidade:', _); }
    toast.success(oportunidade ? 'Oportunidade atualizada!' : 'Oportunidade criada!');
    if (typeof onSuccess === 'function') onSuccess(salvou);
  };

  const content = (
    <FormWrapper schema={schema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className={`space-y-6 w-full h-full ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Dados da Oportunidade
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label>Cliente *</Label>
              <Select
                value={formData.cliente_id || ''}
                onValueChange={(v) => {
                  const cli = clientes.find(c => c.id === v);
                  setFormData({ ...formData, cliente_id: v, cliente_nome: cli?.nome || cli?.razao_social || '' });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome || c.razao_social}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Email do Cliente</Label>
              <Input
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
              />
            </div>

            <div>
              <Label>Telefone</Label>
              <Input
                value={formData.cliente_telefone}
                onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
              />
            </div>

            <div>
              <Label>Origem</Label>
              <Select value={formData.origem} onValueChange={(v) => setFormData({ ...formData, origem: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {origens.length > 0 ? origens.map(o => (
                    <SelectItem key={o.id} value={o.nome}>{o.nome}</SelectItem>
                  )) : (
                    <SelectItem value="Indicação" disabled>Nenhum canal cadastrado</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Responsável</Label>
              <Select
                value={formData.responsavel_id || ''}
                onValueChange={(v) => {
                  const rep = representantes.find(r => r.id === v);
                  setFormData({ ...formData, responsavel_id: v, responsavel: rep?.nome || rep?.nome_completo || '' });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {representantes.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.nome || r.nome_completo || r.codigo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Etapa do Funil</Label>
              <Select value={formData.etapa} onValueChange={(v) => setFormData({ ...formData, etapa: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospecção">Prospecção</SelectItem>
                  <SelectItem value="Contato Inicial">Contato Inicial</SelectItem>
                  <SelectItem value="Qualificação">Qualificação</SelectItem>
                  <SelectItem value="Proposta">Proposta</SelectItem>
                  <SelectItem value="Negociação">Negociação</SelectItem>
                  <SelectItem value="Fechamento">Fechamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor Estimado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_estimado}
                onChange={(e) => setFormData({ ...formData, valor_estimado: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Probabilidade (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.probabilidade}
                onChange={(e) => setFormData({ ...formData, probabilidade: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Temperatura</Label>
              <Select value={formData.temperatura} onValueChange={(v) => setFormData({ ...formData, temperatura: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Frio">Frio</SelectItem>
                  <SelectItem value="Morno">Morno</SelectItem>
                  <SelectItem value="Quente">Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Previsão de Fechamento</Label>
              <Input
                type="date"
                value={formData.data_previsao}
                onChange={(e) => setFormData({ ...formData, data_previsao: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>Necessidades do Cliente</Label>
              <Textarea
                value={formData.necessidades}
                onChange={(e) => setFormData({ ...formData, necessidades: e.target.value })}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" disabled={!podeSalvar} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {oportunidade ? 'Atualizar' : 'Criar'} Oportunidade
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}