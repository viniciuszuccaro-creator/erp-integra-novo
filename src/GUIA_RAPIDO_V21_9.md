# 🚀 GUIA RÁPIDO - ERP ZUCCARO v21.9

## 📍 Onde Acessar as Melhorias

### **Dashboard Executivo**
- **URL**: `https://app.zuccaro.com.br/Dashboard`
- **Novidades**:
  - Informações simplificadas
  - Removido IAContextualModulo duplicado
  - Toggle de auto-refresh (60s)
  - Seletor de período

### **Administração do Sistema** (NOVO MENU)
- **URL**: `https://app.zuccaro.com.br/AdministracaoSistema`
- **6 Abas Principais**:

  1. **📊 Status Sistema** (NOVO)
     - Checkup de problemas corrigidos
     - Status de propagação, RBAC, componentes
     - Próximos passos recomendados
  
  2. **⚙️ Parâmetros Gerais**
     - Configurações globais com toggles
     - Persistem em localStorage + backend
     - Propagam automaticamente para empresas
  
  3. **↔️ Propagação Grupo↔Empresas**
     - 41 entidades DOWN (Grupo → Empresas)
     - 13 entidades UP (Empresa → Grupo)
     - Dashboard de status de sincronização
  
  4. **🔌 Integrações**
     - Google Maps, NFe, WhatsApp, Marketplaces
     - Status de cada integração
     - Testes de conexão
  
  5. **👥 Gestão de Acessos**
     - 6 perfis (Admin, Gerente, Vendedor, etc.)
     - Matriz de permissões granulares
     - Validação SoD (Segregação de Funções)
  
  6. **🔒 Segurança & Governança**
     - Monitoramento em tempo real
     - Alertas de anomalias
     - Logs centralizados
  
  7. **📋 Auditoria & Logs**
     - Todos CRUD logados automaticamente
     - Filtrar por módulo, usuário, período
     - Rastreabilidade completa

---

## ✅ Problemas Corrigidos (5)

### 1. Import de `useState` em `useContextoVisual`
- **Antes**: Import duplicado/faltante → erro em runtime
- **Depois**: Consolidado corretamente
- **Arquivo**: `components/lib/useContextoVisual`

### 2. `createClientFromRequest` duplicado em `syncBidirectional`
- **Antes**: Dupla declaração → deployment error
- **Depois**: Import único no topo
- **Arquivo**: `functions/syncBidirectional`

### 3. Toggles não salvam após refresh
- **Antes**: localStorage sem sincronização com backend
- **Depois**: Hook `useSyncToggleConfig` + `upsertConfig`
- **Arquivo**: `components/lib/useSyncToggleConfig` (NOVO)

### 4. Contadores disparam 429 em cascata
- **Antes**: useEntityCounts em loops → rate limit
- **Depois**: Debounce 50ms + desabilitar refetchOnMount
- **Arquivo**: `components/lib/useEntityCounts`

### 5. IAContextualModulo duplicado no Dashboard
- **Antes**: Renderizado 2x
- **Depois**: Removido do Header
- **Arquivo**: `components/dashboard/DashboardHeader`

---

## 🔐 RBAC: Como Funciona

### **Estrutura de Permissões**
```
Admin (Acesso Total)
├── Visualizar tudo
├── Criar, Editar, Deletar tudo
└── Auditoria + RBAC

Gestor Comercial
├── Módulo: Comercial, CRM, Financeiro
├── Ações: visualizar, criar, editar
└── ❌ Não pode: deletar, alterar RBAC

Contador
├── Módulo: Financeiro, Fiscal
├── Ações: visualizar, criar, editar, deletar
└── ❌ Não pode: excluir auditoria

Operacional
├── Módulo: Estoque, Logística, Produção
├── Ações: visualizar, criar, editar
└── ❌ Não pode: criar contas, vendas
```

### **Como Implementar Permissões em Código**

#### Bloquear Uma Seção Inteira
```jsx
<ProtectedSection 
  module="Financeiro" 
  section={["Contabilidade"]} 
  action="visualizar"
  fallback={<p>Acesso negado</p>}
>
  {/* Conteúdo protegido */}
</ProtectedSection>
```

#### Proteger Um Campo Específico
```jsx
<ProtectedField 
  module="Comercial" 
  field="desconto_percentual"
>
  <Input value={desconto} />
</ProtectedField>
```

#### Desabilitar Um Botão
```jsx
<Button 
  disabled={!hasPermission('Financeiro', 'Contabilidade', 'deletar')}
>
  Deletar
</Button>
```

---

## 🔄 Propagação: Como Funciona

### **Cenário 1: Criar Configuração no Grupo**
```
1. Gestor acessa Administração > Parâmetros Gerais (contexto = Grupo)
2. Habilita toggle "Aceitar PJ"
3. Toggle salva em ConfiguracaoSistema com group_id=grupo_001
4. syncBidirectional automaticamente cria réplicas em TODAS empresas
5. Cada empresa recebe: empresa_id=emp_001, documento_grupo_id=grupo_001, e_replicado=true
6. ✓ Configuração sincronizada em 30 segundos
```

### **Cenário 2: Criar Pedido na Empresa**
```
1. Vendedor cria Pedido na empresa CPA Ferro e Aço (empresa_id=emp_001)
2. Pedido salva com empresa_id=emp_001, group_id=grupo_001
3. syncBidirectional executa direção UP:
   - Cria réplica no Grupo com empresa_dona_id=emp_001, grupo_origem=true
   - Resultado: Pedido aparece na Visão Consolidada do Grupo
4. ✓ Pedido consolidado para análise Grupo em tempo real
```

### **Cenário 3: Deletar Cliente no Grupo**
```
1. Gestor deleta Cliente (id=cli_123) no Grupo
2. syncBidirectional detecta DELETE e executa:
   - Encontra todas réplicas com documento_grupo_id=cli_123
   - Deleta automaticamente em TODAS empresas
   - Log de auditoria registra cascata
3. ✓ Consistência de dados garantida
```

---

## 🎯 Checklist: Validar as Melhorias

### **Teste 1: Toggles Persistem**
- [ ] Acesse Administração > Parâmetros Gerais
- [ ] Habilite um toggle (ex: "Modo Debug")
- [ ] Feche a aba
- [ ] Reabra a aba → toggle deve estar ainda ✓ habilitado

### **Teste 2: Propagação DOWN funciona**
- [ ] Acesse Administração > Propagação
- [ ] Clique "Forçar Sincronização" em ConfiguracaoSistema
- [ ] Abra Dashboard (contexto Empresa)
- [ ] Verifique se as configurações do Grupo aplicam-se à empresa

### **Teste 3: RBAC bloqueia acesso**
- [ ] Faça login com usuário "Vendedor"
- [ ] Tente acessar Administração do Sistema
- [ ] Deve receber "Acesso Restrito" ✓

### **Teste 4: Performance melhorou**
- [ ] Abra Dashboard
- [ ] Verifique se console não mostra 429 errors
- [ ] Carregamento deve ser < 3 segundos

---

## 🆘 Troubleshooting

### **Problema: Toggle não salva**
1. Verifique se está em contexto válido (Grupo OU Empresa selecionada)
2. Abra DevTools > Network → procure requisição POST para `upsertConfig`
3. Se 403: Sem permissão. Verifique RBAC.
4. Se 500: Erro no backend. Verifique logs em Auditoria.

### **Problema: Propagação não sincroniza**
1. Acesse Administração > Auditoria e Logs
2. Filtre por entity=ConfiguracaoSistema
3. Procure por evento "created" ou "updated"
4. Se não houver, propagação não foi acionada → try manual via Propagação tab

### **Problema: RBAC muito restritivo**
1. Acesse Administração > Gestão de Acessos
2. Edite o perfil do usuário
3. Aumente permissões no módulo específico
4. Salve e peça ao usuário fazer refresh (Ctrl+F5)

### **Problema: Dashboard lento ou 429 errors**
1. Verifique DevTools > Network
2. Procure múltiplas requisições em paralelo para countEntities
3. Se sim: Rate limit atingido. Aguarde 30s e recarregue.
4. Se persistir: Escalar para Dev team (possível bug em query).

---

## 📞 Contato & Suporte

- **Bug Report**: Abra issue em Auditoria, descreva o problema
- **Feature Request**: Documento em Base44 Dev
- **Performance Issues**: Verificar logs em `/dashboard/status`
- **RBAC Questions**: Vide "Guia RBAC" acima

---

**Última atualização**: 2026-05-31 v21.9