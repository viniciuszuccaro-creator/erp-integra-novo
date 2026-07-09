import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useCadastrosAllCounts from "@/components/cadastros/hooks/useCadastrosAllCounts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users, Building2, Truck, DollarSign, Package, Cpu
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchInput from "@/components/ui/SearchInput";
import usePermissions from "../components/lib/usePermissions";
import GerenciadorJanelas from "../components/sistema/GerenciadorJanelas";
import Bloco1Pessoas from "@/components/cadastros/blocks/Bloco1Pessoas";
import Bloco2Produtos from "@/components/cadastros/blocks/Bloco2Produtos";
import Bloco3Financeiro from "@/components/cadastros/blocks/Bloco3Financeiro";
import Bloco4Logistica from "@/components/cadastros/blocks/Bloco4Logistica";
import Bloco5Organizacional from "@/components/cadastros/blocks/Bloco5Organizacional";
import Bloco6Tecnologia from "@/components/cadastros/blocks/Bloco6Tecnologia";
import GroupCountBadge from "@/components/cadastros/GroupCountBadge";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ExternalAppsHub from "@/components/administracao-sistema/ExternalAppsHub";
import SemEmpresaBanner from "@/components/common/SemEmpresaBanner";
import IAContextualModulo from "@/components/ia/IAContextualModulo";

export default function Cadastros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [acordeonAberto, setAcordeonAberto] = useState([]);
  const [abaGerenciamento, setAbaGerenciamento] = useState("cadastros");
  const { counts: allCounts, totals, isLoading: countsLoading } = useCadastrosAllCounts();
  // countsLoading passado para blocos filhos (exibe skeleton nas grades)
  const { isAdmin, hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const podeVerCadastros = isAdmin?.() || hasPermission("Cadastros", null, "visualizar") || hasPermission("Cadastros", "Cadastros Gerais", "visualizar");
  const contextoAtivo = Boolean(empresaAtual?.id || grupoAtual?.id);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let t = params.get('tab');
    if (!t) { try { t = localStorage.getItem('Cadastros_tab'); } catch {} }
    if (t) setAbaGerenciamento(t);
  }, []);

  const handleAbaChange = (value) => {
    setAbaGerenciamento(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Cadastros_tab', value); } catch {}
  };

  const handleCardClick = (blocoId) => {
    if (acordeonAberto.includes(blocoId)) {
      setAcordeonAberto(acordeonAberto.filter((id) => id !== blocoId));
    } else {
      setAcordeonAberto([...acordeonAberto, blocoId]);
    }
  };

  if (!podeVerCadastros) {
    return (
      <div className="h-full w-full p-6 lg:p-8 flex items-center justify-center">
        <Card className="w-full max-w-xl rounded-sm border border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-sm text-amber-900">
            Seu perfil ainda nao tem permissao para visualizar Cadastros Gerais.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-0 overflow-auto p-6 lg:p-8 space-y-6">
      <SemEmpresaBanner modulo="Cadastros Gerais" />
      <GerenciadorJanelas />

      <Tabs value={abaGerenciamento} onValueChange={handleAbaChange}>
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <TabsList className="inline-flex flex-nowrap min-w-max gap-2">
              <TabsTrigger value="cadastros" data-permission="Cadastros.visualizar">📋 Cadastros Gerais</TabsTrigger>
              <TabsTrigger value="apps-externos" data-permission="Sistema.Integracoes.visualizar">📱 Apps, Portais & Ambientes Externos</TabsTrigger>
            </TabsList>
            <IAContextualModulo modulo="Cadastros" compact />
          </div>
        </div>

      </Tabs>

      {/* ABA: APPS EXTERNOS */}
      <div style={{ display: abaGerenciamento === "apps-externos" ? undefined : 'none' }} className="mt-4">
        <ExternalAppsHub />
      </div>

      {/* ABA: CADASTROS */}
      <div style={{ display: abaGerenciamento === "cadastros" ? undefined : 'none' }} className="space-y-6 mt-6 w-full">
          {!contextoAtivo && (
            <Card className="rounded-sm border border-amber-200 bg-amber-50">
              <CardContent className="p-3 text-sm text-amber-900">
                Selecione um grupo ou empresa para aplicar o filtro multiempresa nos cadastros.
              </CardContent>
            </Card>
          )}

          {/* SUMÁRIO RÁPIDO — barra de totais compacta (P4: sem cards redundantes) */}
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { id: 'bloco1', label: 'Pessoas', total: totals.bloco1, color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Users },
              { id: 'bloco2', label: 'Produtos', total: totals.bloco2, color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
              { id: 'bloco3', label: 'Financeiro', total: totals.bloco3, color: 'bg-green-100 text-green-800 border-green-200', icon: DollarSign },
              { id: 'bloco4', label: 'Logística', total: totals.bloco4, color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Truck },
              { id: 'bloco5', label: 'Organizacional', total: totals.bloco5, color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Building2 },
              { id: 'bloco6', label: 'Tecnologia', total: totals.bloco6, color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Cpu },
            ].map(({ id, label, total, color, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleCardClick(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-sm ${color}`}
                title={`Ir para ${label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                <span className="font-bold tabular-nums">
                  {(total ?? 0).toLocaleString('pt-BR')}
                </span>
              </button>
            ))}
          </div>

          {/* BUSCA UNIVERSAL */}
          <SearchInput
            placeholder="🔍 Busca Universal - Digite para filtrar em todos os 6 blocos simultaneamente..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            className="h-12 text-base shadow-md border-slate-300"
          />

          {/* ACCORDIONS - 6 BLOCOS */}
          <Accordion type="multiple" value={acordeonAberto} onValueChange={setAcordeonAberto} className="space-y-4">
            <AccordionItem value="bloco1" className="border-2 border-blue-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 hover:from-blue-100 hover:to-blue-200">
                <div className="flex items-center gap-3 flex-1">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-blue-900">1️⃣ Pessoas & Parceiros</p>
                    <p className="text-xs text-blue-700">Clientes • Fornecedores • Transportadoras • Colaboradores • Representantes • Contatos B2B</p>
                  </div>
                  <GroupCountBadge precomputedTotal={totals.bloco1} badgeClassName="ml-auto bg-blue-600 text-white border-blue-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco1Pessoas allCounts={allCounts} isLoading={countsLoading} searchTerm={searchTerm} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bloco2" className="border-2 border-purple-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 hover:from-purple-100 hover:to-purple-200">
                <div className="flex items-center gap-3 flex-1">
                  <Package className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-purple-900">2️⃣ Produtos & Serviços</p>
                    <p className="text-xs text-purple-700">Produtos • Serviços • Setores • Grupos • Marcas • Tabelas de Preço</p>
                  </div>
                  <GroupCountBadge precomputedTotal={totals.bloco2} badgeClassName="ml-auto bg-purple-600 text-white border-purple-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco2Produtos allCounts={allCounts} isLoading={countsLoading} searchTerm={searchTerm} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bloco3" className="border-2 border-green-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 hover:from-green-100 hover:to-green-200">
                <div className="flex items-center gap-3 flex-1">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-green-900">3️⃣ Financeiro & Fiscal</p>
                    <p className="text-xs text-green-700">Bancos • Contas • Formas Pagamento • Plano Contas • Centros Custo</p>
                  </div>
                  <GroupCountBadge precomputedTotal={totals.bloco3} badgeClassName="ml-auto bg-green-600 text-white border-green-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco3Financeiro allCounts={allCounts} isLoading={countsLoading} searchTerm={searchTerm} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bloco4" className="border-2 border-orange-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 hover:from-orange-100 hover:to-orange-200">
                <div className="flex items-center gap-3 flex-1">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-orange-900">4️⃣ Logística, Frota & Almoxarifado</p>
                    <p className="text-xs text-orange-700">Veículos • Motoristas • Tipos Frete • Locais Estoque • Rotas</p>
                  </div>
                  <GroupCountBadge precomputedTotal={totals.bloco4} badgeClassName="ml-auto bg-orange-600 text-white border-orange-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco4Logistica allCounts={allCounts} isLoading={countsLoading} searchTerm={searchTerm} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bloco5" className="border-2 border-indigo-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 hover:from-indigo-100 hover:to-indigo-200">
                <div className="flex items-center gap-3 flex-1">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-indigo-900">5️⃣ Estrutura Organizacional</p>
                    <p className="text-xs text-indigo-700">Grupos • Empresas • Departamentos • Cargos • Turnos</p>
                  </div>
                  <GroupCountBadge precomputedTotal={totals.bloco5} badgeClassName="ml-auto bg-indigo-600 text-white border-indigo-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco5Organizacional allCounts={allCounts} isLoading={countsLoading} searchTerm={searchTerm} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bloco6" className="border-2 border-cyan-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-6 py-4 hover:from-cyan-100 hover:to-cyan-200">
                <div className="flex items-center gap-3 flex-1">
                  <Cpu className="w-6 h-6 text-cyan-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-cyan-900">6️⃣ Tecnologia, IA & Parâmetros</p>
                    <p className="text-xs text-cyan-700">APIs • Webhooks • Chatbot • Jobs • Gateways • Parâmetros Operacionais</p>
                  </div>
                  <GroupCountBadge precomputedTotal={totals.bloco6} badgeClassName="ml-auto bg-cyan-600 text-white border-cyan-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco6Tecnologia allCounts={allCounts} isLoading={countsLoading} searchTerm={searchTerm} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
      </div>
    </div>
  );
}