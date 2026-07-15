import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit } from "lucide-react";
import { useWindow } from "@/components/lib/useWindow";
import CadastroClienteCompleto from "@/components/cadastros/CadastroClienteCompleto";
import usePainelDinamicoCliente from "@/components/cadastros/painel-dinamico-cliente/usePainelDinamicoCliente";
import PainelClienteColunaInfo from "@/components/cadastros/painel-dinamico-cliente/PainelClienteColunaInfo";
import PainelClienteColunaHistorico from "@/components/cadastros/painel-dinamico-cliente/PainelClienteColunaHistorico";
import PainelClienteColunaTabs from "@/components/cadastros/painel-dinamico-cliente/PainelClienteColunaTabs";

/**
 * V21.1.2 - WINDOW MODE READY
 * P1 (Regra-Mãe): Refatorado em hook + 3 sub-componentes.
 * P2: Multi-tenant — queries via filterInContext no hook.
 * P4: Layout w-full h-full com rolagem interna.
 */
export default function PainelDinamicoCliente({ cliente, isOpen, onClose, windowMode = false }) {
  const { openWindow } = useWindow();
  const { pedidos, totalEmAberto } = usePainelDinamicoCliente(cliente, isOpen);

  if (!cliente) return null;

  const handleEditarCadastro = () => {
    openWindow(
      CadastroClienteCompleto,
      { cliente, windowMode: true },
      {
        title: `Editar Cliente: ${cliente.nome || cliente.razao_social}`,
        width: 1100,
        height: 650,
      }
    );
    if (onClose) onClose();
  };

  const content = (
    <>
      <div className={`border-b pb-4 px-6 pt-6 flex-shrink-0 ${windowMode ? '' : 'bg-gradient-to-r from-blue-50 to-slate-50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {cliente.nome || cliente.razao_social}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={
                cliente.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                cliente.status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
                cliente.status === 'Bloqueado' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }>
                {cliente.status}
              </Badge>
              {cliente.tipo && (
                <Badge variant="outline">{cliente.tipo}</Badge>
              )}
              {cliente.cpf && <span className="text-sm text-slate-600">CPF: {cliente.cpf}</span>}
              {cliente.cnpj && <span className="text-sm text-slate-600">CNPJ: {cliente.cnpj}</span>}
            </div>
          </div>

          <Button
            onClick={handleEditarCadastro}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar no Cadastro Geral
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full h-full">
        <div className="grid grid-cols-3 gap-6 p-6">
          {/* COLUNA 1: Informações Principais */}
          <PainelClienteColunaInfo cliente={cliente} totalEmAberto={totalEmAberto} />

          {/* COLUNA 2: Histórico de Atividades */}
          <PainelClienteColunaHistorico clienteId={cliente.id} />

          {/* COLUNA 3: Endereços, Produtos, Canais + Últimos Pedidos */}
          <PainelClienteColunaTabs cliente={cliente} pedidos={pedidos} />
        </div>
      </div>
    </>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white overflow-auto">{content}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1180px] h-[620px] p-0 overflow-hidden flex flex-col">
        {content}
      </DialogContent>
    </Dialog>
  );
}