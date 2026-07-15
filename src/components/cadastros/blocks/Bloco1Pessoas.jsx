import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import { Users, Building2, Truck, User, Award, MessageCircle, TrendingUp, MapPin } from "lucide-react";
import CountBadgeSimplificado from "@/components/cadastros/CountBadgeSimplificado";

import CadastroClienteCompleto from "@/components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "@/components/cadastros/CadastroFornecedorCompleto";
import TransportadoraForm from "@/components/cadastros/TransportadoraForm";
import ColaboradorForm from "@/components/rh/ColaboradorForm";
import RepresentanteFormCompleto from "@/components/cadastros/RepresentanteFormCompleto";
import ContatoB2BForm from "@/components/cadastros/ContatoB2BForm";
import SegmentoClienteForm from "@/components/cadastros/SegmentoClienteForm";
import RegiaoAtendimentoForm from "@/components/cadastros/RegiaoAtendimentoForm";

function filterTiles(tiles, searchTerm) {
  const q = String(searchTerm || "").trim().toLowerCase();
  if (!q) return tiles;
  return tiles.filter(({ k, t }) => `${k} ${t}`.toLowerCase().includes(q));
}

export default function Bloco1Pessoas({ allCounts, isLoading, searchTerm = "" }) {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  const canViewEntity = (entidade) => (
    hasPermission('Cadastros', entidade, 'visualizar') || hasPermission('Cadastros', null, 'visualizar')
  );

  const openList = (entidade, titulo, Icon, campos, FormComp) => () => {
    openWindow(
      VisualizadorUniversalEntidade,
      {
        nomeEntidade: entidade,
        tituloDisplay: titulo,
        icone: Icon,
        camposPrincipais: campos,
        componenteEdicao: FormComp,
        windowMode: true,
      },
      { title: titulo, width: 1400, height: 800 }
    );
  };

  const tiles = [
    { k: 'Cliente',           t: 'Clientes',                    i: Users,         c: ['codigo','nome','razao_social','cnpj','status','tipo'],                        f: CadastroClienteCompleto },
    { k: 'Fornecedor',        t: 'Fornecedores',                i: Building2,     c: ['codigo','nome','razao_social','cnpj','categoria','status_fornecedor'],         f: CadastroFornecedorCompleto },
    { k: 'Transportadora',    t: 'Transportadoras',             i: Truck,         c: ['codigo','razao_social','nome_fantasia','cnpj','cidade','status'],              f: TransportadoraForm },
    { k: 'Colaborador',       t: 'Colaboradores',               i: User,          c: ['matricula','nome_completo','cargo','departamento','tipo_contrato','status'],   f: ColaboradorForm },
    { k: 'Representante',     t: 'Representantes & Indicadores',i: Award,         c: ['codigo','nome','email','telefone','percentual_comissao'],                      f: RepresentanteFormCompleto },
    { k: 'ContatoB2B',        t: 'Contatos B2B',                i: MessageCircle, c: ['codigo','nome','cargo','email','telefone'],                                    f: ContatoB2BForm },
    { k: 'SegmentoCliente',   t: 'Segmentos de Cliente',        i: TrendingUp,    c: ['codigo','nome','descricao','tipo'],                                            f: SegmentoClienteForm },
    { k: 'RegiaoAtendimento', t: 'Regiões de Atendimento',      i: MapPin,        c: ['codigo_regiao','nome','descricao','tipo'],                                     f: RegiaoAtendimentoForm },
  ];
  const filteredTiles = filterTiles(tiles, searchTerm);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="rounded-sm shadow-sm border bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b rounded-t-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-700" /> Pessoas & Parceiros
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-600">Total consolidado do grupo/empresa.</CardContent>
      </Card>

      {filteredTiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
        <Card key={k} className="rounded-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group border"
          onClick={canViewEntity(k) ? openList(k, t, Icon, c, FormComp) : undefined}
          data-action={`Cadastros.${k}.abrir`}>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-sm bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                {t}
                <CountBadgeSimplificado entities={[k]} allCounts={allCounts} isLoading={isLoading} />
              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-sm text-xs h-7"
                onClick={(e) => { e.stopPropagation(); openList(k, t, Icon, c, FormComp)(); }}
                disabled={!canViewEntity(k)}
                data-action={`Cadastros.${k}.abrir`}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 text-xs text-slate-500">
            Clique para listar, criar e editar em janela flutuante.
          </CardContent>
        </Card>
      ))}
    </div>
  );
}