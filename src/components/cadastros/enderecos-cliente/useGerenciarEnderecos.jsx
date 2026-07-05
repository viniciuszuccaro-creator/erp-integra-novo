import { useState } from "react";
import { toast } from "sonner";

const ENDERECO_VAZIO = {
  apelido: "", tipo_endereco: "Entrega", cep: "", logradouro: "", numero: "",
  complemento: "", bairro: "", cidade: "", estado: "", latitude: null, longitude: null,
  mapa_url: "", horario_inicio: "", horario_fim: "", contato_nome: "", contato_telefone: "", observacoes: "", principal: false
};

/**
 * Hook extraído de GerenciarEnderecosClienteForm.jsx
 * Gerencia estado do endereço, validação, salvar/editar/excluir
 */
export function useGerenciarEnderecos({ enderecos = [], onChange }) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [novoEndereco, setNovoEndereco] = useState(ENDERECO_VAZIO);

  const resetForm = () => {
    setNovoEndereco(ENDERECO_VAZIO);
    setEnderecoEditando(null);
  };

  const handleSalvarEndereco = () => {
    if (!novoEndereco.logradouro || !novoEndereco.numero) {
      toast.error("Preencha logradouro e número");
      return;
    }

    let mapaUrl = novoEndereco.mapa_url;
    if (!mapaUrl) {
      if (novoEndereco.latitude && novoEndereco.longitude) {
        mapaUrl = `https://www.google.com/maps?q=${novoEndereco.latitude},${novoEndereco.longitude}`;
      } else if (novoEndereco.cep) {
        mapaUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${novoEndereco.logradouro}, ${novoEndereco.numero}, ${novoEndereco.bairro}, ${novoEndereco.cidade}, ${novoEndereco.estado}, ${novoEndereco.cep}`
        )}`;
      }
    }

    const enderecosAtualizados = [...enderecos];
    const enderecoComMapa = { ...novoEndereco, mapa_url: mapaUrl };

    if (enderecoEditando !== null) {
      enderecosAtualizados[enderecoEditando] = enderecoComMapa;
    } else {
      enderecosAtualizados.push(enderecoComMapa);
    }

    if (novoEndereco.principal) {
      enderecosAtualizados.forEach((end, idx) => {
        if (idx !== enderecoEditando) end.principal = false;
      });
    }

    onChange(enderecosAtualizados);
    setDialogAberto(false);
    resetForm();
  };

  const handleEditarEndereco = (index) => {
    setEnderecoEditando(index);
    setNovoEndereco({ ...enderecos[index] });
    setDialogAberto(true);
  };

  const handleExcluirEndereco = (index) => {
    onChange(enderecos.filter((_, i) => i !== index));
  };

  const abrirNovo = () => {
    resetForm();
    setDialogAberto(true);
  };

  return {
    dialogAberto, setDialogAberto, enderecoEditando,
    novoEndereco, setNovoEndereco,
    resetForm, handleSalvarEndereco, handleEditarEndereco, handleExcluirEndereco, abrirNovo
  };
}