/**
 * Cliente Base44 local — Invocação de funções backend (simuladas) + Core integrations
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import { makeId, now } from './storage';
import { sortRecords } from './query';
import { entities } from './entityApi';
import { expandLocalContextFilter } from './context';
import { evaluateLocalPermission } from './permissions';

const upsertConfig = async ({ chave, data = {}, scope = {} }) => {
  const filter = { chave, ...scope };
  const existing = await entities.ConfiguracaoSistema.filter(filter, '-updated_date', 1);
  const payload = {
    chave,
    categoria: data.categoria || 'Sistema',
    ...data,
    ...scope,
    updated_date: now(),
  };
  const record = existing[0]
    ? await entities.ConfiguracaoSistema.update(existing[0].id, payload)
    : await entities.ConfiguracaoSistema.create(payload);
  return { data: { record } };
};

const countEntity = async (entityName, filter = {}) => {
  const rows = await entities[entityName].filter(filter);
  return rows.length;
};

export const functions = {
  async invoke(name, payload = {}) {
    switch (name) {
      case 'getEntityRecord': {
        if (!payload.entityName) return { data: [] };
        const filter = expandLocalContextFilter(payload.entityName, payload.filter || {});
        const data = await entities[payload.entityName].filter(filter, payload.sortField, payload.limit);
        return { data };
      }
      case 'entityListSorted': {
        if (!payload.entityName) return { data: [] };
        const filter = expandLocalContextFilter(payload.entityName, payload.filter || {});
        const data = await entities[payload.entityName].filter(filter, payload.sortField, payload.limit);
        return { data: sortRecords(data, payload.sortField, payload.sortDirection) };
      }
      case 'upsertConfig':
        return upsertConfig(payload);
      case 'countEntities': {
        if (payload.entityName) {
          const filter = expandLocalContextFilter(payload.entityName, payload.filter || {});
          const count = await countEntity(payload.entityName, filter);
          return { data: { count, counts: { [payload.entityName]: count }, [payload.entityName]: count } };
        }
        const entitiesList = payload.entities || [];
        const counts = {};
        for (const item of entitiesList) {
          const entityName = typeof item === 'string' ? item : item.entityName || item.name;
          if (entityName) counts[entityName] = await countEntity(entityName, expandLocalContextFilter(entityName, item.filter || {}));
        }
        return { data: { counts, ...counts } };
      }
      case 'entityGuard':
        {
          const result = evaluateLocalPermission(payload);
          return {
            data: {
              allowed: result.allowed,
              can: result.allowed,
              permitido: result.allowed,
              local: true,
              reason: result.reason || null,
            },
          };
        }
      case 'verifyTotp':
        return { data: { valid: true, local: true } };
      case 'iaFinanceAnomalyScan':
      case 'groupConsolidation':
      case 'conflictPolicy':
      case 'sodValidator':
      case 'seedData':
      case 'backfillGroupEmpresa':
        return { data: { ok: true, local: true, message: 'Simulado localmente.' } };
      default:
        return { data: { ok: true, local: true, functionName: name, message: 'Funcao externa simulada no modo local.' } };
    }
  },
};

export const Core = {
  async InvokeLLM(payload = {}) {
    return {
      response: payload.response_json_schema ? {} : 'Resposta simulada localmente. Configure um provedor local de IA para respostas reais.',
      data: payload.response_json_schema ? {} : undefined,
      local: true,
    };
  },
  async SendEmail() {
    return { success: true, local: true, message: 'Email nao enviado: modo local.' };
  },
  async SendSMS() {
    return { success: true, local: true, message: 'SMS nao enviado: modo local.' };
  },
  async UploadFile({ file } = {}) {
    return { file_url: `local://uploads/${file?.name || makeId('arquivo')}`, url: `local://uploads/${file?.name || makeId('arquivo')}`, local: true };
  },
  async GenerateImage() {
    return { url: '', local: true, message: 'Geracao de imagem externa desativada no modo local.' };
  },
  async ExtractDataFromUploadedFile() {
    return { output: {}, data: {}, local: true, message: 'Extracao externa desativada no modo local.' };
  },
};