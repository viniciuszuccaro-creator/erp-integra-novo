# ✅ VALIDAÇÃO P2 — PROPAGAÇÃO BIDIRECIONAL GRUPO ↔ EMPRESAS

## 📋 CHECKLIST DE TESTES

### **Teste 1: Baixa de Título no Grupo → Replicar em Empresa**

**Cenário:** Título de NF-e gerado no Grupo deve baixar automaticamente na empresa específica.

**Passos:**
1. Logar como admin no contexto **Grupo**
2. Ir para **Financeiro → Contas a Receber**
3. Selecionar um título (ex: "NF-2026-0001-CPA Ferro")
4. Clicar em **Baixar** com valor completo
5. Confirmar ação → Audit log deve registrar:
   ```
   usuario: admin
   acao: Edição
   modulo: Financeiro
   entidade: ContaReceber
   group_id: grupo_001
   empresa_id: null (feito no grupo)
   descricao: "Baixa de título NF-2026-0001-CPA Ferro"
   dados_novos: {status: "Recebido", data_recebimento: "2026-06-13", ...}
   ```
6. Aguardar sincronização (máx 5 seg) via `syncBidirectional`
7. Logar como operador na **Empresa 3Z**
8. Ir para **Financeiro → Contas a Receber**
9. **Validar:** O mesmo título agora está com status **"Recebido"**
10. Audit log em Empresa 3Z deve conter:
    ```
    usuario: sync_system
    acao: Sincronização
    modulo: Financeiro
    grupo_id: grupo_001
    empresa_id: empresa_3z
    descricao: "Sincronização descendente: ContaReceber id=123 de Grupo para Empresa"
    ```

---

### **Teste 2: Venda em Empresa → Aparecer no Consolidado do Grupo**

**Cenário:** Pedido criado em Empresa "CPA Ferro e Aço" deve aparecer na visão consolidada do Grupo.

**Passos:**
1. Logar como vendedor em **Empresa CPA Ferro e Aço**
2. Ir para **Comercial → Pedidos**
3. Criar novo pedido:
   ```
   Cliente: Acme Corp
   Produtos: 100kg de Aço 1020
   Valor: R$ 5.000
   Status: Rascunho
   ```
4. Clicar **Salvar** → Audit log:
   ```
   usuario: vendedor_cpaa
   acao: Criação
   modulo: Comercial
   entidade: Pedido
   group_id: grupo_cpa
   empresa_id: empresa_cpaa
   dados_novos: {numero_pedido: "PED-2026-0015", status: "Rascunho", ...}
   ```
5. Logar como gerente no contexto **Grupo CPA**
6. Ir para **Comercial → Pedidos** (contexto de grupo)
7. **Validar:** O pedido "PED-2026-0015" aparece na lista consolidada
8. Clicar no pedido → Deve ver todos os dados

---

### **Teste 3: Faturamento no Grupo → NF-e Emitida na Empresa Correta**

**Cenário:** Ao marcar um Pedido como "Faturado" no Grupo, NF-e deve ser emitida **apenas pela empresa correta**, não por todas.

**Passos:**
1. Logar como admin no contexto **Grupo**
2. Ir para **Comercial → Pedidos**
3. Filtrar: Mostrar todos (grupo + empresas)
4. Selecionar pedido de **Empresa B** (ex: "PED-2026-0010")
5. Clicar **Gerar NF-e** → Backend:
   ```
   Validação:
   - pedido.empresa_id = empresa_b (Não deixar gerar NF por outra empresa)
   - pedido.group_id = grupo_atual
   
   Ação:
   - Criar NotaFiscal com empresa_id = empresa_b
   - Não gerar para Empresa A, C, D
   
   Audit:
   ```
   usuario: admin_sistema
   acao: Criação
   modulo: Fiscal
   entidade: NotaFiscal
   empresa_id: empresa_b (CRÍTICO: deve ser a empresa correta)
   group_id: grupo_atual
   ```
6. Validar em **Empresa B**: NF deve aparecer em **Fiscal → Notas Fiscais**
7. Validar em **Empresa A**: NF NÃO deve aparecer

---

### **Teste 4: Auditoria de Sincronização**

**Cenário:** Toda propagação Grupo ↔ Empresas deve registrar audit trail completo.

**Passos:**
1. Executar qualquer operação que dispare `syncBidirectional`
2. Ir para **Administração do Sistema → Auditoria**
3. Filtrar: `tipo_auditoria = "sincronizacao"`
4. **Validar:** Cada sincronização regista:
   ```
   {
     usuario: "sync_system" ou nome do usuário
     usuario_id: id ou null
     acao: "Sincronização"
     modulo: "Financeiro" / "Comercial" etc
     tipo_auditoria: "sincronizacao"
     entidade: "ContaReceber" / "Pedido" etc
     grupo_id: "grupo_xxx"
     empresa_id: "empresa_yyy"
     descricao: "Sincronização descendente/ascendente: [Entidade] id=[id]"
     data_hora: timestamp
     dados_novos: {...mudanças}
   }
   ```

---

### **Teste 5: Conflitos de Sincronização (Edge Case)**

**Cenário:** Se mesmo campo for editado simultaneamente em Grupo e Empresa, qual vence?

**Passos:**
1. Abrir simultaneamente em 2 abas:
   - Aba 1: Admin logado em **Grupo**, abrindo ContaReceber id=XYZ
   - Aba 2: Operador logado em **Empresa A**, abrindo mesmo ContaReceber id=XYZ
2. Aba 1: Editar "Status" para "Recebido" + Salvar
3. Aba 2: Editar "Status" para "Contestado" + Salvar
4. **Esperado:**
   - Último a salvar vence (timestamp)
   - Audit logs mostram **ambas** edições
   - Campo `conflito_detectado` = true (se implementado)

---

## 📊 MATRIZ DE VALIDAÇÃO

| Teste | Resultado | Data | Responsável | Evidência |
|-------|-----------|------|------------|-----------|
| 1. Baixa Grupo → Empresa | ⏳ Pendente | - | - | Audit log |
| 2. Venda Empresa → Grupo | ⏳ Pendente | - | - | Aparece consolidado |
| 3. Faturamento → NF Correta | ⏳ Pendente | - | - | NF em empresa_id correto |
| 4. Audit Sincronização | ⏳ Pendente | - | - | AuditLog registra tudo |
| 5. Conflitos Edge Case | ⏳ Pendente | - | - | Timestamp vence; audit completo |

---

## 🔧 IMPLEMENTAÇÃO DE SUPORTE (Se Falhar)

### **Se Teste 1 Falhar:**
Verificar função `syncBidirectional`:
```
functions/syncBidirectional.js → linha ~50
Confirmar:
- Trigger após update em Grupo
- Filtro por group_id
- Replicação para todas empresas do grupo
```

### **Se Teste 3 Falhar:**
Verificar função `nfeActions`:
```
functions/nfeActions.js → linha ~100
Confirmar:
- Validação: pedido.empresa_id !== null
- Criar NF com empresa_id = pedido.empresa_id
- Não deixar criar para outra empresa
```

---

## 📝 NOTAS

- Testes devem ser executados em **ambiente sandbox** antes de produção
- Cada teste deve ter **pelo menos 2 pessoas**: uma em Grupo, outra em Empresa
- Audit logs devem ser exportados para análise pós-teste
- Conflitos devem ser resolvidos com regra de **timestamp vence**

---

**Status:** 🟡 PENDENTE EXECUÇÃO  
**Próxima Revisão:** Após execução completa dos 5 testes