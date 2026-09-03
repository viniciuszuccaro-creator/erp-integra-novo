// Regra-Mãe 3: Extraído de useContextoVisual.jsx — consulta server-side ordenada com filtro multiempresa
import { base44 } from "@/api/base44Client";
import { DEFAULT_SORTS, normalizeSortField, getLastSort, setLastSort } from "./contextoSorts";

export function createFilterInContext({ getFiltroContexto, empresasDoGrupo }) {
  const filterInContext = async (entityName, criterios = {}, order = undefined, limit = undefined, campo = 'empresa_id') => {
    const ENTITY_CONTEXT_FIELD = { Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id', NotaFiscal: 'empresa_faturamento_id', TransferenciaFilial: 'empresa_origem_id' };
    const SHARED_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora']);
    const ctxCampo = ENTITY_CONTEXT_FIELD[entityName] || campo || 'empresa_id';

    const scope = getFiltroContexto(ctxCampo, true) || {};
    const groupId = scope.group_id;
    const empresaId = scope[ctxCampo];

    // Detecta suporte a contexto via schema
    let hasGroupField = true;
    let hasCtxField = true;
    try {
      const sch = (base44.entities?.[entityName]?.schema ? await base44.entities[entityName].schema() : null);
      const props = sch?.properties || {};
      hasGroupField = Object.prototype.hasOwnProperty.call(props, 'group_id');
      hasCtxField = Object.prototype.hasOwnProperty.call(props, ctxCampo);
    } catch (e) { console.error('[lib] catch:', e); }
    const noContext = !hasGroupField && !hasCtxField;

    if (!groupId && !empresaId && !noContext) return [];

    const rest = { ...criterios };

    // Contexto de GRUPO (sem empresa específica): filtro simples por group_id (indexado e rápido)
    // O backend expandGroupFilter retorna { group_id } diretamente, sem $or/$in complexo
    if (groupId && !empresaId) {
      const filtro = noContext ? { ...rest } : { ...rest, group_id: groupId };
      if (entityName === 'PerfilAcesso') {
        // Inclui legacy (group_id: null) para perfis criados antes do multi-tenant
        filtro.$or = [{ group_id: groupId }, { grupo_id: groupId }, { group_id: null, empresa_id: null }];
        delete filtro.group_id;
      }
      // TransferenciaFilial precisa de empresa_origem/destino (backend não expande)
      if (entityName === 'TransferenciaFilial' && Array.isArray(empresasDoGrupo) && empresasDoGrupo.length) {
        const empresasIds = empresasDoGrupo.map(e => e.id).filter(Boolean);
        filtro.$or = [{ group_id: groupId }, { empresa_origem_id: { $in: empresasIds } }, { empresa_destino_id: { $in: empresasIds } }];
        delete filtro.group_id;
      }
      // seguir para sort + invoke abaixo
      return (async () => {
        let sortField2, sortDirection2;
        if (typeof order === 'string' && order.length) {
          sortDirection2 = order.startsWith('-') ? 'desc' : 'asc';
          sortField2 = normalizeSortField(entityName, order.replace(/^-/, ''));
          setLastSort(entityName, { sortField: sortField2, sortDirection: sortDirection2 });
        } else {
          const last = getLastSort(entityName);
          sortField2 = normalizeSortField(entityName, last?.sortField || DEFAULT_SORTS[entityName]?.field || 'updated_date');
          sortDirection2 = last?.sortDirection || DEFAULT_SORTS[entityName]?.direction || 'desc';
        }
        const res = await base44.functions.invoke('entityListSorted', {
          entityName, filter: filtro, sortField: sortField2, sortDirection: sortDirection2, limit: limit || 100,
        });
        return Array.isArray(res?.data) ? res.data : [];
      })();
    }

    // Contexto de EMPRESA: $or mínimo com empresaId + shared (para entidades compartilhadas)
    const orConds = [];
    if (empresaId) {
      if (entityName === 'Cliente') {
        orConds.push(
          { empresa_id: empresaId },
          { empresa_dona_id: empresaId },
          { empresas_compartilhadas_ids: { $in: [empresaId] } }
        );
      } else {
        orConds.push({ [ctxCampo]: empresaId });
        if (SHARED_SET.has(entityName)) {
          orConds.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
        }
      }
    }

    const filtro = noContext ? { ...rest } : { ...rest, ...(orConds.length ? { $or: orConds } : {}) };

    // Derivar sort
    let sortField, sortDirection;
    if (typeof order === 'string' && order.length) {
      sortDirection = order.startsWith('-') ? 'desc' : 'asc';
      sortField = normalizeSortField(entityName, order.replace(/^-/, ''));
      setLastSort(entityName, { sortField, sortDirection });
    } else {
      const last = getLastSort(entityName);
      sortField = normalizeSortField(entityName, last?.sortField || DEFAULT_SORTS[entityName]?.field || 'updated_date');
      sortDirection = last?.sortDirection || DEFAULT_SORTS[entityName]?.direction || 'desc';
    }

    const res = await base44.functions.invoke('entityListSorted', {
      entityName,
      filter: filtro,
      sortField,
      sortDirection,
      limit: limit || 100,
    });
    return Array.isArray(res?.data) ? res.data : [];
  };

  return { filterInContext };
}