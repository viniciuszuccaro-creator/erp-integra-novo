/**
 * HubAtendimentoTabs — navegação entre abas do Hub de Atendimento.
 */
import { Button } from "@/components/ui/button";
import {
  MessageCircle, User, BarChart3, FileText, Settings, Timer,
  Users, Brain, Maximize2, Minimize2,
} from "lucide-react";

const TABS = [
  { id: "atendimento", label: "Atendimento", icon: MessageCircle, permission: "HubAtendimento.Atendimento.visualizar", activeColor: "bg-blue-600" },
  { id: "meupainel", label: "Meu Painel", icon: User, permission: "HubAtendimento.Painel.visualizar", activeColor: "bg-purple-600" },
  { id: "analytics", label: "Analytics", icon: BarChart3, permission: "HubAtendimento.Analytics.visualizar", activeColor: "bg-blue-600" },
  { id: "templates", label: "Templates", icon: FileText, permission: "HubAtendimento.Templates.visualizar", activeColor: "bg-blue-600" },
  { id: "config", label: "Canais", icon: Settings, permission: "HubAtendimento.Canais.visualizar", activeColor: "bg-blue-600" },
  { id: "sla", label: "SLA", icon: Timer, permission: "HubAtendimento.SLA.visualizar", activeColor: "bg-blue-600" },
  { id: "fila", label: "Fila", icon: Users, permission: "HubAtendimento.Fila.visualizar", activeColor: "bg-blue-600" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, permission: "HubAtendimento.Relatorios.visualizar", activeColor: "bg-blue-600" },
  { id: "multicanal", label: "Multi", icon: MessageCircle, permission: "HubAtendimento.Multicanal.visualizar", activeColor: "bg-blue-600" },
  { id: "base", label: "Base IA", icon: Brain, permission: "HubAtendimento.BaseConhecimento.visualizar", activeColor: "bg-blue-600" },
];

export default function HubAtendimentoTabs({ abaAtiva, setAbaAtiva, layoutExpandido, setLayoutExpandido }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Button
          key={tab.id}
          variant={abaAtiva === tab.id ? "default" : "outline"}
          onClick={() => setAbaAtiva(tab.id)}
          size="sm"
          className={abaAtiva === tab.id ? tab.activeColor : ""}
        >
          <tab.icon className="w-4 h-4 lg:mr-2" />
          <span className="hidden lg:inline">{tab.label}</span>
        </Button>
      ))}
      <Button variant="outline" size="sm" onClick={() => setLayoutExpandido(!layoutExpandido)} title={layoutExpandido ? "Reduzir" : "Expandir"}>
        {layoutExpandido ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}