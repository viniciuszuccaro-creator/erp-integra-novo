// Regra-Mãe 3: Refatorado em módulos focados sob ./contexto/ — comportamento e API pública preservados
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useUser } from "./UserContext";
import useContextoGrupoEmpresa from "./useContextoGrupoEmpresa";
import { createDistribuicaoHelpers } from "./contexto/contextoDistribuicao";
import { createCrudHelpers } from "./contexto/contextoCrud";
import { createFilterInContext } from "./contexto/filterInContextFactory";

export function useContextoVisual() {
  const { user, isLoading: loadingUser } = useUser();
  const [contexto, setContexto] = useState(() => {
    try {
      return localStorage.getItem('contexto_atual') || 'empresa';
    } catch {
      return 'empresa';
    }
  });

  const {
    grupoAtual,
    empresaAtual: empresaContexto,
    empresasDoGrupo: empresasDoGrupoContexto,
    estaNoGrupo: estaNoGrupoContexto,
    estaEmEmpresa,
    isLoading: loadingContextoGrupoEmpresa
  } = useContextoGrupoEmpresa();

  // Sincroniza o contexto local com o contexto real (grupo/empresa)
  useEffect(() => {
    setContexto(estaNoGrupoContexto ? 'grupo' : 'empresa');
  }, [estaNoGrupoContexto]);

  const { data: empresas = [], isLoading: loadingEmpresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
    staleTime: 15000,
  });

  const [empresaAtualId, setEmpresaAtualId] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresa_atual_id');
    if (storedEmpresaId) {
      setEmpresaAtualId(storedEmpresaId);
    } else if (empresaContexto) {
      setEmpresaAtualId(empresaContexto.id);
    }
  }, [empresaContexto]);

  const empresaAtual = (contexto === 'grupo') ? null : (empresas.find(empresa => empresa.id === empresaAtualId) || empresaContexto || null);
  const empresasDoGrupo = empresas.filter(empresa => empresa.group_id === grupoAtual?.id);
  const estaNoGrupo = contexto === 'grupo';

  useEffect(() => {
    try {
      localStorage.setItem('contexto_atual', contexto);
    } catch (e) {
      console.warn('Erro ao salvar contexto:', e);
    }
  }, [contexto]);

  // Persistir o grupo atual para headers multi-tenant
  useEffect(() => {
    try {
      if (grupoAtual?.id) {
        localStorage.setItem('group_atual_id', grupoAtual.id);
      }
    } catch (e) {
      console.warn('Erro ao salvar grupo:', e);
    }
  }, [grupoAtual?.id]);

  const adaptarMenuPorContexto = (menuItems) => {
    if (!user) return menuItems;

    if (contexto === 'grupo') {
      return menuItems.map(item => ({
        ...item,
        destacado: ['Dashboard Corporativo', 'Gestão de Empresas', 'Relatórios e Análises'].includes(item.title)
      }));
    }

    return menuItems.map(item => ({
      ...item,
      destacado: ['Comercial e Vendas', 'Produção e Manufatura', 'Expedição e Logística'].includes(item.title)
    }));
  };

  const obterSugestoesNavegacao = () => {
    return [];
  };

  const alternarContexto = () => {
    setContexto(prevContexto => prevContexto === 'empresa' ? 'grupo' : 'empresa');
  };

  const selecionarEmpresa = (empresaId) => {
    setEmpresaAtualId(empresaId);
    try {
      localStorage.setItem('empresa_atual_id', empresaId);
    } catch (e) {
      console.warn('Erro ao salvar empresa:', e);
    }
  };

  // Helpers: multiempresa stamping and server-side filter
  const getFiltroContexto = (campo = 'empresa_id', incluirGrupo = false) => {
    const filtro = {};
    if (incluirGrupo && grupoAtual?.id) filtro.group_id = grupoAtual.id;
    if (contexto === 'grupo') {
      if (filtroEmpresa !== 'todas') filtro[campo] = filtroEmpresa;
    } else if (empresaAtual?.id) {
      filtro[campo] = empresaAtual.id;
    }
    return filtro;
  };

  const carimbarContexto = (dados, campo = 'empresa_id') => {
    return {
      ...dados,
      ...(grupoAtual?.id && !dados?.group_id ? { group_id: grupoAtual.id } : {}),
      ...((contexto !== 'grupo') && empresaAtual?.id && !dados?.[campo] ? { [campo]: empresaAtual.id } : {}),
    };
  };

  // Consulta server-side ordenada (módulo ./contexto/filterInContextFactory)
  const { filterInContext } = createFilterInContext({ getFiltroContexto, empresasDoGrupo });

  // Compatibilidade: se receber array -> filtra local; se receber string -> delega para filterInContext (consulta server com ordenação)
  const filtrarPorContexto = (arg, campo = 'empresa_id', maybeOrder, maybeLimit) => {
    // Caso 1: entidade (string) => usa backend ordenado e multiempresa
    if (typeof arg === 'string') {
      const entityName = arg;
      const criterios = typeof campo === 'object' ? campo : {};
      const order = typeof maybeOrder === 'string' ? maybeOrder : undefined;
      const limit = typeof maybeLimit === 'number' ? maybeLimit : undefined;
      const contextoCampo = typeof campo === 'string' ? campo : 'empresa_id';
      return filterInContext(entityName, criterios, order, limit, contextoCampo);
    }

    // Caso 2: lista local (array) => mantém filtro por contexto (retrocompatibilidade)
    const dados = Array.isArray(arg) ? arg : [];
    if (!dados || dados.length === 0) return [];

    if (estaNoGrupo) {
      if (filtroEmpresa !== 'todas') {
        return dados.filter(item => item[campo] === filtroEmpresa || item.group_id === grupoAtual?.id);
      }
      return dados.filter(item =>
        item.group_id === grupoAtual?.id ||
        empresasDoGrupo.some(emp => emp.id === item[campo])
      );
    }

    if (estaEmEmpresa && empresaAtual) {
      return dados.filter(item =>
        item[campo] === empresaAtual.id ||
        (item.group_id && item.documento_grupo_id && item[campo] === empresaAtual.id)
      );
    }

    return dados;
  };

  // Helpers de origem/distribuição (módulo ./contexto/contextoDistribuicao)
  const { adicionarColunasContexto } = createDistribuicaoHelpers(empresasDoGrupo);

  // CRUD com auditoria e exclusão lógica (módulo ./contexto/contextoCrud)
  const { createInContext, bulkCreateInContext, updateInContext, deleteInContext } = createCrudHelpers(carimbarContexto);

  return {
    contexto,
    empresaAtual,
    empresasDoGrupo,
    estaNoGrupo: contexto === 'grupo',
    grupoAtual,
    isLoading: loadingUser || loadingEmpresas || loadingContextoGrupoEmpresa,
    filtrarPorContexto,
    getFiltroContexto,
    carimbarContexto,
    createInContext,
    bulkCreateInContext,
    filterInContext,
    adicionarColunasContexto,
    alternarContexto,
    selecionarEmpresa,
    adaptarMenuPorContexto,
    obterSugestoesNavegacao,
    filtroEmpresa,
    setFiltroEmpresa,
    updateInContext,
    deleteInContext
  };
}

export default useContextoVisual;