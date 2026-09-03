// Regra-Mãe 3: Refatorado em módulos focados sob ./contexto-grupo/ — API e comportamento preservados
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { criarCarregadorContextoInicial } from "./contexto-grupo/carregarContextoInicial";
import { useTrocasContexto } from "./contexto-grupo/trocaContextoMutations";
import { criarHelpersDistribuicao } from "./contexto-grupo/rateioDistribuicao";
import { useEmpresasDoGrupo } from "./contexto-grupo/useEmpresasDoGrupo";

export function useContextoGrupoEmpresa() {
  const [user, setUser] = useState(null);
  const [contexto, setContexto] = useState(() => {
    try {
      return localStorage.getItem('contexto_atual') || 'empresa';
    } catch {
      return 'empresa';
    }
  });
  const [isLoadingContexto, setIsLoadingContexto] = useState(true);
  const [grupoAtual, setGrupoAtual] = useState(null);
  const [empresaAtual, setEmpresaAtual] = useState(null);
  const queryClient = useQueryClient();

  const carregarContextoInicial = criarCarregadorContextoInicial({
    setUser, setContexto, setGrupoAtual, setEmpresaAtual, setIsLoadingContexto
  });

  useEffect(() => {
    carregarContextoInicial();
  }, []);

  const { trocarParaGrupo, trocarParaEmpresa } = criarTrocasContexto({
    user,
    setUser,
    setContexto,
    setGrupoAtual,
    setEmpresaAtual,
    queryClient,
  });

  const empresasDoGrupo = useEmpresasDoGrupo(grupoAtual, contexto);

  // Getters preservam a leitura do valor atual no momento da chamada (como nos closures originais)
  const grupoAtualRef = useRef(grupoAtual);
  grupoAtualRef.current = grupoAtual;
  const empresasDoGrupoRef = useRef(empresasDoGrupo);
  empresasDoGrupoRef.current = empresasDoGrupo;

  const {
    obterPoliticaPadrao,
    calcularDistribuicao,
    ratearDocumento,
    sincronizarBaixaParaEmpresas,
    sincronizarBaixaParaGrupo,
  } = criarHelpersDistribuicao({
    getGrupoId: () => grupoAtualRef.current?.id,
    getEmpresasDoGrupo: () => empresasDoGrupoRef.current,
  });

  return {
    user,
    contexto,
    grupoAtual,
    empresaAtual,
    empresasDoGrupo,
    estaNoGrupo: contexto === 'grupo',
    estaEmEmpresa: contexto === 'empresa',
    podeOperarEmGrupo: user?.pode_operar_em_grupo || false,
    podeVerTodasEmpresas: user?.pode_ver_todas_empresas || false,
    trocarParaGrupo,
    trocarParaEmpresa,
    obterPoliticaPadrao,
    calcularDistribuicao,
    ratearDocumento,
    sincronizarBaixaParaEmpresas,
    sincronizarBaixaParaGrupo,
    isLoading: isLoadingContexto || !user
  };
}

export default useContextoGrupoEmpresa;