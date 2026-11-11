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
    <EntregaAtivaView {...hook} onVoltar={() => hook.setEntregaAtual(null)} />
  );
}