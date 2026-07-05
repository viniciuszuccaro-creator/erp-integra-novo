/**
 * HubAtendimentoFiltros — barra de filtros de conversas (busca, status, canal, prioridade).
 */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";

export default function HubAtendimentoFiltros({
  buscaTexto, setBuscaTexto,
  filtroStatus, setFiltroStatus,
  filtroCanal, setFiltroCanal,
  filtroPrioridade, setFiltroPrioridade,
  onRefresh,
}) {
  return (
    <Card>
      <CardContent className="p-3 lg:p-4">
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <div className="flex-1 min-w-[180px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar cliente, assunto..." value={buscaTexto} onChange={(e) => setBuscaTexto(e.target.value)} className="pl-9 w-full" />
          </div>

          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="Todas">Todos Status</option>
            <option value="Em Progresso">Em Progresso</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Não Atribuída">Não Atribuída</option>
            <option value="Resolvida">Resolvidas</option>
          </select>

          <select value={filtroCanal} onChange={(e) => setFiltroCanal(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="Todos">Todos Canais</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Telegram">Telegram</option>
            <option value="Email">Email</option>
            <option value="WebChat">WebChat</option>
            <option value="Portal">Portal</option>
            <option value="SMS">SMS</option>
          </select>

          <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="Todas">Todas Prioridades</option>
            <option value="Urgente">🔴 Urgente</option>
            <option value="Alta">🟠 Alta</option>
            <option value="Normal">🟢 Normal</option>
            <option value="Baixa">⚪ Baixa</option>
          </select>

          <Button variant="outline" size="sm" data-permission="HubAtendimento.Atendimento.visualizar" onClick={onRefresh} title="Atualizar">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}