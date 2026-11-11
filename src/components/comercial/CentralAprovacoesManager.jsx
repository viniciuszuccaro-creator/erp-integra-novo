import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, DollarSign, Shield, ShieldCheck, XCircle } from "lucide-react";
import useCentralAprovacoes from "@/components/comercial/central-aprovacoes/useCentralAprovacoes";
import AprovacoesKPIs from "@/components/comercial/central-aprovacoes/AprovacoesKPIs";
import AprovacoesTable from "@/components/comercial/central-aprovacoes/AprovacoesTable";

const rotuloTipo = {
  liberar_credito: 'Liberação de limite de crédito',
  liberacao_vencido: 'Liberação com título vencido',
};

const moeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// §18: limite e título vencido usam a mesma fila (SolicitacaoAprovacao), com contraproposta de limite.
function FilaSolicitacoes({ tipo, solicitacoes = [], permitido, onDecidir, carregando }) {
  const [selecionada, setSelecionada] = useState(null);
  const [comentarios, setComentarios] = useState('');
  const [novoLimite, setNovoLimite] = useState('');

  const lista = solicitacoes.filter((s) => s.tipo_solicitacao === tipo);
  const pendentes = lista.filter((s) => s.status === 'pendente');
  const historico = lista.filter((s) => s.status !== 'pendente');

  const decidir = (solicitacao, aprovado) => {
    const contraproposta = tipo === 'liberar_credito' && novoLimite ? { limite_credito: Number(novoLimite) } : null;
    if (aprovado && contraproposta && !(contraproposta.limite_credito > 0)) return;
    onDecidir({ solicitacao, aprovado, comentarios, contraproposta });
    setSelecionada(null);
    setComentarios('');
    setNovoLimite('');
  };

  return (
    <>
      <Card className="border-0 shadow-md mt-4">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-5 h-5 text-purple-600" />
            {rotuloTipo[tipo]} · {pendentes.length} pendente(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Cliente / Orçamento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((solicitacao) => {
                const aberta = selecionada === solicitacao.id;
                return (
                  <TableRow key={solicitacao.id} className="align-top">
                    <TableCell>
                      <p className="font-semibold text-slate-800">{solicitacao.dados_propostos?.cliente_nome || '—'}</p>
                      <p className="text-xs text-slate-500">{solicitacao.dados_propostos?.numero_orcamento || solicitacao.entidade_alvo}</p>
                    </TableCell>
                    <TableCell className="font-bold">{moeda(solicitacao.valor_solicitado)}</TableCell>
                    <TableCell className="max-w-[280px] text-xs text-slate-600">{solicitacao.justificativa}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {solicitacao.solicitante_nome || '—'}
                      <br />
                      {solicitacao.data_solicitacao ? new Date(solicitacao.data_solicitacao).toLocaleString('pt-BR') : '—'}
                    </TableCell>
                    <TableCell>
                      {aberta ? (
                        <div className="w-64 space-y-1.5">
                          {tipo === 'liberar_credito' && (
                            <Input
                              type="number" min="0" step="0.01" placeholder="Novo limite (contraproposta)"
                              value={novoLimite} onChange={(e) => setNovoLimite(e.target.value)} className="h-8 text-xs"
                            />
                          )}
                          <Input
                            placeholder="Comentário / justificativa"
                            value={comentarios} onChange={(e) => setComentarios(e.target.value)} className="h-8 text-xs"
                          />
                          <div className="flex gap-1.5">
                            <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" disabled={!permitido} onClick={() => decidir(solicitacao, true)}>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-700" disabled={!permitido} onClick={() => decidir(solicitacao, false)}>
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelecionada(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelecionada(solicitacao.id); setComentarios(''); setNovoLimite(''); }}>
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Decidir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!carregando && pendentes.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma solicitação pendente nesta fila.</p>
            </div>
          )}
          {carregando && <p className="py-6 text-center text-sm text-slate-500">Carregando a fila…</p>}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md mt-6">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Histórico · {rotuloTipo[tipo]}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Cliente / Orçamento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Decisão</TableHead>
                <TableHead>Contraproposta</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.slice(0, 20).map((solicitacao) => (
                <TableRow key={solicitacao.id}>
                  <TableCell className="font-semibold">
                    {solicitacao.dados_propostos?.cliente_nome || '—'}
                    <span className="block text-xs font-normal text-slate-500">{solicitacao.dados_propostos?.numero_orcamento || ''}</span>
                  </TableCell>
                  <TableCell>{moeda(solicitacao.valor_solicitado)}</TableCell>
                  <TableCell>
                    <Badge className={solicitacao.status === 'aprovado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {solicitacao.status === 'aprovado' ? 'Aprovado' : solicitacao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {solicitacao.contraproposta?.limite_credito
                      ? `Limite ${moeda(solicitacao.contraproposta.limite_credito)}`
                      : (solicitacao.comentarios_aprovacao || '—')}
                  </TableCell>
                  <TableCell className="text-xs">
                    {solicitacao.data_decisao ? new Date(solicitacao.data_decisao).toLocaleString('pt-BR') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {historico.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Nenhuma decisão registrada.</p>}
        </CardContent>
      </Card>
    </>
  );
}

function CentralAprovacoesManager({ windowMode = false, initialTab = "descontos", empresaId = null }) {
  const {
    activeTab, setActiveTab: _setActiveTab, permitido,
    pedidosPendentes, pedidosAprovados, pedidosNegados,
    aprovarPedidoMutation, negarPedidoMutation,
    solicitacoes, decidirSolicitacao, carregandoSolicitacoes,
  } = useCentralAprovacoes(empresaId);

  const [currentTab, setCurrentTab] = useState(initialTab || activeTab || 'descontos');

  const containerClass = windowMode ? 'w-full h-full flex flex-col overflow-hidden' : 'space-y-6';
  const contentClass = windowMode ? 'flex-1 overflow-y-auto p-6' : '';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {!permitido && (
          <Alert className="border-red-300 bg-red-50 mb-6">
            <Shield className="w-4 h-4 text-red-600" />
            <AlertDescription>
              <p className="font-semibold text-red-900">Acesso negado</p>
              <p className="text-sm text-red-700 mt-1">Apenas administradores e gerentes podem acessar a Central de Aprovações.</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-orange-600" />
              Central de Aprovações
            </h2>
            <p className="text-slate-600 text-sm">Desconto, limite de crédito e liberação de título vencido, com histórico e contraproposta</p>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="descontos">Descontos</TabsTrigger>
            <TabsTrigger value="limite">Limite de Crédito</TabsTrigger>
            <TabsTrigger value="duplicatas">Duplicatas Vencidas</TabsTrigger>
          </TabsList>

          <TabsContent value="descontos">
            <AprovacoesKPIs
              pendentes={pedidosPendentes.length}
              aprovados={pedidosAprovados.length}
              negados={pedidosNegados.length}
            />
            <AprovacoesTable
              pendentes={pedidosPendentes}
              historico={[...pedidosAprovados, ...pedidosNegados]}
              permitido={permitido}
              onAprovar={(params) => aprovarPedidoMutation.mutate(params)}
              onNegar={(params) => negarPedidoMutation.mutate(params)}
            />
          </TabsContent>

          <TabsContent value="limite">
            <FilaSolicitacoes
              tipo="liberar_credito"
              solicitacoes={solicitacoes}
              permitido={permitido}
              carregando={carregandoSolicitacoes}
              onDecidir={(params) => decidirSolicitacao.mutate(params)}
            />
          </TabsContent>

          <TabsContent value="duplicatas">
            <FilaSolicitacoes
              tipo="liberacao_vencido"
              solicitacoes={solicitacoes}
              permitido={permitido}
              carregando={carregandoSolicitacoes}
              onDecidir={(params) => decidirSolicitacao.mutate(params)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CentralAprovacoesManager;