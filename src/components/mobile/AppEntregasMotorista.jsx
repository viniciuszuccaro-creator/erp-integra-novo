import React from "react";
import useEntregasMotorista from "./useEntregasMotorista";
import EntregaListaView from "./EntregaListaView";
import EntregaAtivaView from "./EntregaAtivaView";

export default function AppEntregasMotorista() {
  const hook = useEntregasMotorista();

  if (!hook.entregaAtual) {
    return (
      <EntregaListaView
        minhasEntregas={hook.minhasEntregas}
        localizacao={hook.localizacao}
        isOffline={hook.isOffline}
        smsNumero={hook.smsNumero}
        setSmsNumero={hook.setSmsNumero}
        iniciarEntrega={hook.iniciarEntrega}
        user={hook.user}
        operacoesPendentes={hook.operacoesPendentes}
      />
    );
  }

  return (
    <EntregaAtivaView
      entregaAtual={hook.entregaAtual}
      localizacao={hook.localizacao}
      isOffline={hook.isOffline}
      smsNumero={hook.smsNumero}
      setSmsNumero={hook.setSmsNumero}
      fotoComprovante={hook.fotoComprovante}
      setFotoComprovante={hook.setFotoComprovante}
      nomeRecebedor={hook.nomeRecebedor}
      setNomeRecebedor={hook.setNomeRecebedor}
      documentoRecebedor={hook.documentoRecebedor}
      setDocumentoRecebedor={hook.setDocumentoRecebedor}
      setAssinaturaBase64={hook.setAssinaturaBase64}
      tirarFoto={hook.tirarFoto}
      confirmarEntrega={hook.confirmarEntrega}
      registrarOcorrencia={hook.registrarOcorrencia}
      registrarReversa={hook.registrarReversa}
      reversaMotivo={hook.reversaMotivo}
      setReversaMotivo={hook.setReversaMotivo}
      reversaQtd={hook.reversaQtd}
      setReversaQtd={hook.setReversaQtd}
      reversaValor={hook.reversaValor}
      setReversaValor={hook.setReversaValor}
      onVoltar={() => hook.setEntregaAtual(null)}
    />
  );
}