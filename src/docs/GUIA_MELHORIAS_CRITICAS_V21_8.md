# 🔧 GUIA DE MELHORIAS CRÍTICAS - ERP ZUCCARO v21.8

## 📌 AÇÕES IMEDIATAS (Esta semana)

### 1. ✅ COMPLETAR PROPAGAÇÃO BIDIRECIONAL

#### **Fornecedor - Adicionar DOWN (Grupo → Empresas)**

**Arquivo:** `entities/Fornecedor.json`  
**Ação:** Adicionar campos de propagação

```json
{
  "documento_grupo_id": {
    "type": "string",
    "description": "ID do fornecedor no grupo (se replicado)"
  },
  "e_replicado": {
    "type": "boolean",
    "default": false,
    "description": "Flag anti-loop para propagação"
  }
}
```

**Backend:** Adicionar automação entity para `Fornecedor`
```javascript
// Na création do syncBidirectional, adicionar:
'down': ['Fornecedor', 'NotaFiscal', 'Entrega', ...]
```

---

#### **NotaFiscal - Adicionar DOWN**

**Lógica:**
- Quando NF emitida no Grupo → replica para empresa correspondente
- Campo: `documento_grupo_id` (rastreia origem)
- Campo: `empresa_id` (destino da empresa)

**Implementar em:**
- `functions/syncBidirectional` (adicionar NotaFiscal à lista down)
- `functions/nfeActions` (chamar syncBidirectional após emissão)

---

#### **Entrega - Adicionar DOWN**

**Lógica:**
- Quando entrega criada no Grupo → replica para empresa
- Vinculada ao `documento_grupo_id` da origem

**Implementar em:**
- `functions/syncBidirectional` (adicionar Entrega)
- Automação: `onEntregaUpdated` → chamar sync

---

### 2. ✅ APLICAR COMPONENTES AUDITADOS

#### **Prioridade 1 - Forms Críticos**

```
CadastroFornecedorCompleto
├── Nome (InputWithAudit)
├── CNPJ (InputWithAudit com máscara)
├── Status (SelectWithAudit)
├── Tipos Veículo (CheckboxWithAudit[])
└── Ativo (CheckboxWithAudit)

CadastroProdutoFormV22_Completo
├── Descrição (InputWithAudit)
├── Tipo Item (SelectWithAudit)
├── Preço (InputWithAudit)
├── Ativo (CheckboxWithAudit)
└── Unidades Secundárias (CheckboxWithAudit[])

CadastroClienteCompleto
├── Nome (InputWithAudit)
├── CPF/CNPJ (InputWithAudit)
├── Tipo (RadioGroupWithAudit)
├── Contatos (InputWithAudit[])
└── Ativo (CheckboxWithAudit)
```

**Script de migração:** Buscar `<input>`, `<select>`, `<checkbox>` nativos e trocar por auditados.

---

### 3. ✅ CONSOLIDAR WIDGETS NO DASHBOARD

**Ação:** Criar `WidgetBase.jsx` genérico

```jsx
// components/dashboard/WidgetBase.jsx
export function WidgetBase({ 
  title, icon: Icon, loading, error, children, 
  actions, className, size = 'md' 
}) {
  const sizeClasses = {
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80',
    full: 'h-96'
  };

  return (
    <Card className={`${sizeClasses[size]} ${className}`}>
      <CardHeader className="flex justify-between">
        <CardTitle className="flex gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          {title}
        </CardTitle>
        {actions && <div className="flex gap-1">{actions}</div>}
      </CardHeader>
      <CardContent className="h-full">
        {loading ? <LoadingSkeleton /> : error ? <ErrorState /> : children}
      </CardContent>
    </Card>
  );
}
```

**Usar em:**
- KPICard → remover e usar WidgetBase
- ChartCard → remover e usar WidgetBase
- StatsList → remover e usar WidgetBase
- WidgetRealtimeStatus → remover e usar WidgetBase

**Benefício:** -400 linhas de código duplicado.

---

## 🔍 VERIFICAÇÕES CRÍTICAS

### **Propagação - Teste Manual**

```bash
# Grupo: Criar ContaReceber
POST /api/entities/ContaReceber
{
  "group_id": "grupo_001",
  "empresa_id": null,
  "descricao": "Venda CPA",
  "valor": 1000
}

# Verificar: Deve replicar em todas as empresas do grupo
GET /api/entities/ContaReceber?empresa_id=cpa_id
# Esperado: cópia com documento_grupo_id = original.id
```

### **RBAC - Teste Manual**

```bash
# Usuário role="user" (não admin)
GET /api/pages/AdministracaoSistema
# Esperado: Redirecionar para PortalCliente

# Botão sem permissão
<Button data-permission="Sistema.Integrações.executar">
# Esperado: Mostrar badge "Acesso negado"
```

### **Toggle - Teste Manual**

```bash
# Ir em Admin → Gerais → Toggle qualquer configuração
# Ação: Mudar estado
# Esperado: Salvar no backend + persistir após F5
# Campo no DB: valor do toggle atualizado
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1
- [ ] Adicionar Fornecedor ao DOWN (funcão + automação)
- [ ] Adicionar NotaFiscal ao DOWN (função + automação)
- [ ] Adicionar Entrega ao DOWN (função + automação)
- [ ] Testar propagação: criar no grupo → verificar em empresas
- [ ] Testar delete cascade: deletar no grupo → deletar replicas

### Semana 2
- [ ] Substituir inputs nativos por InputWithAudit em 5 forms
- [ ] Substituir selects nativos por SelectWithAudit em 5 forms
- [ ] Substituir checkboxes nativos por CheckboxWithAudit em 5 forms
- [ ] Criar WidgetBase e refatorar 4 widgets
- [ ] Testes E2E de propagação

### Semana 3
- [ ] Aplicar audit em 10 forms restantes
- [ ] Performance: bundle size analysis + otimizações
- [ ] Granular RBAC em Produção (apontamentos)
- [ ] Documentação: padrão multiempresa

---

## 🎯 MÉTRICAS DE SUCESSO

| Métrica | Inicial | Meta | Resultado |
|---------|---------|------|-----------|
| Propagação Bidirecional | 75% | 100% | _(em progresso)_ |
| RBAC Cobertura | 90% | 95%+ | _(em progresso)_ |
| Componentes Auditados | 85% | 100% | _(em progresso)_ |
| Duplicação Código | ~5% | <2% | _(em progresso)_ |
| Performance Lighthouse | 70 | 85+ | _(verificar)_ |

---

## 🚀 GANHOS ESPERADOS

✅ **Propagação 100%** — Sincronização perfeita entre grupo e empresas  
✅ **Auditoria Completa** — 100% das alterações rastreadas  
✅ **Segurança** — RBAC em 100% dos componentes  
✅ **Performance** — Bundle otimizado, carregamento mais rápido  
✅ **Manutenção** — Código consolidado, menos duplicação  

---

## 📞 SUPORTE

**Dúvidas sobre implementação?**
- Consultar: `docs/RELATORIO_CHECKUP_ESTRUTURAL_V21_8.md`
- Exemplos: `functions/syncBidirectional.js` (padrão completo)
- Testes: Usar `test_backend_function` para validar propagação