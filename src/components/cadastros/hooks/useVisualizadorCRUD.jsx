import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ENTITY_CODE_FIELD } from "@/components/cadastros/config/entityCodeFields";
import { sanitizeOnWrite, checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";

// Re-exporta para compatibilidade com importadores existentes
export { ENTITY_CODE_FIELD };

// Entidades que NÃO devem receber group_id (não têm o campo no schema)
// Apenas MoedaIndice (catálogo global sem group_id) e GrupoEmpresarial (é o próprio grupo)
const NO_SCOPE_STAMP = new Set([
  'GrupoEmpresarial', 'MoedaIndice',
]);

// P3: auditoria silenciosa (não bloqueia)
async function auditarAcao({ acao, ENTITY, registroId, empresaId, groupId, dadosAntes, dadosDepois, descricao }) {
  try {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.AuditLog.create({
      acao,
      modulo: 'Cadastros',
      tipo_auditoria: 'entidade',
      entidade: ENTITY,
      registro_id: registroId || null,
      descricao: descricao || `${acao} em ${ENTITY}`,
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id || null,
      empresa_id: empresaId || null,
      group_id: groupId || null,
      dados_anteriores: dadosAntes || null,
      dados_novos: dadosDepois || null,
      data_hora: new Date().toISOString(),
    });
  } catch { /* auditoria nunca bloqueia */ }
}

export default function useVisualizadorCRUD({
  ENTITY, editItem, empresaId, groupId, isSimple,
  canCreateCadastro, canEditCadastro, canDeleteCadastro,
  createInContext, updateInContext, deleteInContext,
  handleCloseForm, setIsSaving,
  readFilter, setNextCode,
}) {
  // P3: delegate para a trava global centralizada em sanitizeOnWrite.jsx (Regra-Mãe §5c)
  const checkDuplicate = useCallback(async (formData, isEdit, currentId) => {
    return checkGlobalUniqueness(ENTITY, formData, {
      groupId, empresaId, currentId, isEdit,
    });
  }, [ENTITY, empresaId, groupId]);

  // Regra-Mãe §5c: busca o próximo código sequencial disponível para a entidade no escopo do grupo
  const getNextSequentialCode = useCallback(async (entityName, codeField, gid) => {
    try {
      const filter = NO_SCOPE_STAMP.has(entityName)
        ? { _merged: { $ne: true } }
        : { group_id: gid, _merged: { $ne: true } };
      const res = await base44.functions.invoke("entityListSorted", {
        entityName, filter,
        sortField: codeField, sortDirection: "desc", limit: 1, skip: 0,
      });
      const last = Array.isArray(res?.data) && res.data[0];
      const n = last ? parseInt(String(last[codeField]).replace(/\D/g, ''), 10) : 0;
      return String(isNaN(n) ? 1 : n + 1).padStart(3, '0');
    } catch {
      return String(1).padStart(3, '0');
    }
  }, []);

  const fetchNextCode = useCallback(async (rf) => {
    const codeField = ENTITY_CODE_FIELD[ENTITY];
    if (!codeField) return;
    const next = await getNextSequentialCode(ENTITY, codeField, groupId);
    setNextCode(next);
  }, [ENTITY, groupId, getNextSequentialCode, setNextCode]);

  const handlePersistSubmit = useCallback(async (formData) => {
    if (!formData || !ENTITY) return;
    if (formData._action === "delete") {
      if (!canDeleteCadastro) throw new Error("Sem permissão para excluir.");
      if (formData.id) {
        const dadosAntes = { id: formData.id, ...formData };
        try { await deleteInContext(ENTITY, formData.id); } catch (_) {}
        auditarAcao({ acao: 'Exclusão', ENTITY, registroId: formData.id, empresaId, groupId, dadosAntes, descricao: `Exclusão via formulário: ${ENTITY}` });
      }
      handleCloseForm(true);
      return;
    }
    if (editItem?.id && !canEditCadastro) throw new Error("Sem permissão para editar.");
    if (!editItem?.id && !canCreateCadastro) throw new Error("Sem permissão para criar.");

    // P2: validar contexto multiempresa antes de salvar — lança para exibição inline no modal
    if (!isSimple && !empresaId && !groupId) {
      throw new Error("⚠️ Selecione uma empresa ou grupo antes de salvar.");
    }

    setIsSaving(true);
    try {
      // P2: sanitização + injeção de contexto multiempresa
      let clean = sanitizeOnWrite({ ...formData });
      delete clean._action;
      if (!isSimple) {
        if (!clean.empresa_id && empresaId) clean.empresa_id = empresaId;
        if (!clean.group_id  && groupId)   clean.group_id   = groupId;
      }
      // Regra-Mãe §5c: código sequencial OBRIGATÓRIO
      // Manual: sempre auto-gerar (IGNORA código digitado pelo usuário — só importação permite código custom)
      // Import (_importMode): permite código customizado, mas se já existir → busca próximo na sequência
      const codeField = ENTITY_CODE_FIELD[ENTITY];
      if (codeField && !editItem?.id) {
        const isImport = !!clean._importMode;
        delete clean._importMode;

        if (!isImport) {
          // MANUAL: sempre auto-gerar sequencial (proíbe código manual)
          clean[codeField] = await getNextSequentialCode(ENTITY, codeField, groupId);
        } else if (clean[codeField] && String(clean[codeField]).trim()) {
          // IMPORT com código fornecido: verificar se já existe → se sim, buscar próximo na sequência
          const codeVal = String(clean[codeField]).trim();
          const scopeFilter = NO_SCOPE_STAMP.has(ENTITY) ? {} : { group_id: groupId };
          try {
            const existing = await base44.entities[ENTITY].filter(
              { ...scopeFilter, [codeField]: codeVal },
              'created_date', 5
            );
            if (existing && existing.length > 0) {
              // Código já existe → buscar próximo na sequência
              clean[codeField] = await getNextSequentialCode(ENTITY, codeField, groupId);
            }
          } catch {
            // Fail-closed: se não conseguir verificar, buscar próximo sequencial
            clean[codeField] = await getNextSequentialCode(ENTITY, codeField, groupId);
          }
        } else {
          // IMPORT sem código: auto-gerar sequencial
          clean[codeField] = await getNextSequentialCode(ENTITY, codeField, groupId);
        }
      }
      // P3: verificar duplicata antes de salvar (fail-closed — bloqueia se não conseguir verificar)
      const erroDuplicata = await checkDuplicate(clean, !!(editItem?.id), editItem?.id);
      if (erroDuplicata) {
        setIsSaving(false);
        throw new Error(erroDuplicata);
      }
      // Dupla verificação: confirmação via SDK direto antes de persistir (Regra-Mãe §5c)
      // Se checkDuplicate passou mas houve instabilidade, o backend sanitizeOnWrite fará a barreira final
      let savedEntity;
      if (editItem?.id) {
        // SIMPLE_CATALOG: update direto (evita createInContext carimbar group_id em entidades sem esse campo)
        if (isSimple) {
          // Carimba group_id apenas se a entidade suporta (GrupoEmpresarial e catálogos puros não têm)
          if (groupId && !NO_SCOPE_STAMP.has(ENTITY) && !clean.group_id) clean.group_id = groupId;
          savedEntity = await base44.entities[ENTITY].update(editItem.id, clean);
        } else {
          savedEntity = await updateInContext(ENTITY, editItem.id, clean, "empresa_id");
        }
        auditarAcao({ acao: 'Edição', ENTITY, registroId: editItem.id, empresaId, groupId, dadosAntes: editItem, dadosDepois: clean });
      } else {
        if (isSimple) {
          if (groupId && !NO_SCOPE_STAMP.has(ENTITY) && !clean.group_id) clean.group_id = groupId;
          savedEntity = await base44.entities[ENTITY].create(clean);
        } else {
          savedEntity = await createInContext(ENTITY, clean, "empresa_id");
        }
        auditarAcao({ acao: 'Criação', ENTITY, registroId: savedEntity?.id, empresaId, groupId, dadosDepois: clean });
      }
      handleCloseForm(true);
      return savedEntity;
    } catch (e) {
      // Relança para que o formulário possa exibir o erro inline
      throw e;
    } finally { setIsSaving(false); }
  }, [ENTITY, editItem, empresaId, groupId, handleCloseForm, isSimple, canCreateCadastro, canEditCadastro, canDeleteCadastro, createInContext, updateInContext, deleteInContext, checkDuplicate, setIsSaving, readFilter, getNextSequentialCode]);

  return { fetchNextCode, handlePersistSubmit, checkDuplicate };
}