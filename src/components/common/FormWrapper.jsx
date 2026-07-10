import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import FormErrorSummary from "@/components/common/FormErrorSummary";
import useContextoVisual from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";

/**
 * FormWrapper
 * - Padroniza RHF + Zod
 * - Carimba multiempresa automaticamente (group_id/empresa_id) via useContextoVisual
 * - Exibe resumo de erros consistente
 * - Garante layout responsivo: w-full h-full
 * - TRAVA GLOBAL DE UNICIDADE: se entityName for fornecido, valida código/descrição
 *   duplicados antes de salvar (Regra-Mãe §5c: validação dupla em ações sensíveis)
 *
 * Props principais:
 * - schema?: zod schema (opcional)
 * - defaultValues?: any
 * - onSubmit: (dadosCarimbados, methods) => void | Promise<void>
 * - withContext?: boolean (default true)
 * - contextFieldName?: string (default 'empresa_id')
 * - className?: string
 * - children: ReactNode | (methods) => ReactNode
 * - entityName?: string — habilita trava global de unicidade (ex: 'Produto')
 * - editItemId?: string — ID do registro em edição (exclui da verificação de duplicata)
 */
export default function FormWrapper({
  schema,
  defaultValues,
  onSubmit,
  withContext = true,
  contextFieldName = 'empresa_id',
  className = '',
  mode = 'onChange',
  reValidateMode = 'onChange',
  externalData,
  entityName,
  editItemId,
  children,
}) {
  const { carimbarContexto, empresaAtual, grupoAtual } = useContextoVisual();
  const methods = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode,
    reValidateMode,
  });

  const [errorMessages, setErrorMessages] = React.useState([]);

  const handleValid = async (data) => {
    // Suporte a dados externos (formularios controlados legacy)
    if (externalData) {
      const stampedExternal = withContext ? carimbarContexto(externalData, contextFieldName) : externalData;
      if (schema) {
        const parsed = schema.safeParse(stampedExternal);
        if (!parsed.success) {
          const msgs = parsed.error.issues?.map(i => i.message) || ['Verifique os campos destacados.'];
          setErrorMessages(msgs);
          return;
        }
      }
      // TRAVA GLOBAL: verifica unicidade de código/descrição antes de salvar
      if (entityName) {
        const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
        const empresaId = empresaAtual?.id || null;
        const erroUnicidade = await checkGlobalUniqueness(entityName, stampedExternal, {
          groupId, empresaId, currentId: editItemId, isEdit: !!editItemId,
        });
        if (erroUnicidade) { setErrorMessages([erroUnicidade]); return; }
      }
      setErrorMessages([]);
      if (typeof onSubmit === 'function') { try { await onSubmit(stampedExternal, methods); } catch (e) { setErrorMessages([e?.message || 'Erro ao salvar.']); } }
      return;
    }

    const payload = withContext ? carimbarContexto(data, contextFieldName) : data;
    if (schema) {
      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        const msgs = parsed.error.issues?.map(i => i.message) || ['Verifique os campos destacados.'];
        setErrorMessages(msgs);
        return;
      }
    }
    // TRAVA GLOBAL: verifica unicidade de código/descrição antes de salvar
    if (entityName) {
      const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
      const empresaId = empresaAtual?.id || null;
      const erroUnicidade = await checkGlobalUniqueness(entityName, payload, {
        groupId, empresaId, currentId: editItemId, isEdit: !!editItemId,
      });
      if (erroUnicidade) { setErrorMessages([erroUnicidade]); return; }
    }
    setErrorMessages([]);
    if (typeof onSubmit === 'function') {
      try { await onSubmit(payload, methods); } catch (e) { setErrorMessages([e?.message || 'Erro ao salvar.']); }
    }
  };

  const handleInvalid = (formErrors) => {
    try {
      const flat = Object.values(formErrors || {}).flatMap((e) => {
        if (!e) return [];
        const base = e.message ? [e.message] : [];
        const inner = e.types ? Object.values(e.types) : [];
        const nested = e.ref ? [] : [];
        return [...base, ...inner, ...nested].filter(Boolean);
      });
      setErrorMessages(flat.length ? flat : ['Verifique os campos destacados.']);
    } catch (_) {
      setErrorMessages(['Verifique os campos destacados.']);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleValid, handleInvalid)}
        className={cn('w-full h-full space-y-6', className)}
      >
        <FormErrorSummary messages={errorMessages} />
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  );
}

// Helper opcional para compor submissões fora do FormWrapper
export function withContextSubmit(handler, carimbar, fieldName = 'empresa_id') {
  return (data, methods) => handler(carimbar ? carimbar(data, fieldName) : data, methods);
}