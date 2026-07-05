import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGerenciarEnderecos } from "./enderecos-cliente/useGerenciarEnderecos";
import EnderecosLista from "./enderecos-cliente/EnderecosLista";
import EnderecoFormDialog from "./enderecos-cliente/EnderecoFormDialog";

/**
 * V21.1.2 - SUB-DIALOG MANTIDO (usado dentro de forms maiores)
 * Refatorado: lógica em useGerenciarEnderecos, UI em sub-componentes (Regra-Mãe)
 */
export default function GerenciarEnderecosClienteForm({ enderecos = [], onChange }) {
  const {
    dialogAberto, setDialogAberto, enderecoEditando,
    novoEndereco, setNovoEndereco,
    resetForm, handleSalvarEndereco, handleEditarEndereco, handleExcluirEndereco, abrirNovo
  } = useGerenciarEnderecos({ enderecos, onChange });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Endereços de Entrega ({enderecos.length})</h3>
        <Button onClick={abrirNovo} data-permission="Cadastros.Cliente.editar" size="sm">
          <Plus className="w-4 h-4 mr-2" />Adicionar Endereço
        </Button>
      </div>

      <EnderecosLista enderecos={enderecos} onEditar={handleEditarEndereco} onExcluir={handleExcluirEndereco} />

      {enderecos.length === 0 && (
        <div className="text-center">
          <Button onClick={abrirNovo} variant="outline" size="sm" className="mt-3">
            <Plus className="w-4 h-4 mr-2" />Adicionar Primeiro Endereço
          </Button>
        </div>
      )}

      <EnderecoFormDialog
        dialogAberto={dialogAberto} setDialogAberto={setDialogAberto} enderecoEditando={enderecoEditando}
        novoEndereco={novoEndereco} setNovoEndereco={setNovoEndereco}
        handleSalvarEndereco={handleSalvarEndereco} resetForm={resetForm}
      />
    </div>
  );
}