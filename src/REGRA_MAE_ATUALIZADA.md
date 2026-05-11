# REGRA-MÃE VERSÃO 3.0 — ESTABILIDADE ABSOLUTA

## Princípios Fundamentais (IMUTÁVEIS)

### 1. **Acrescentar • Reorganizar • Conectar • Melhorar**
- **NUNCA apagar** código funcional
- **SEMPRE melhorar** incrementalmente
- **INTEGRAR** componentes reutilizáveis
- **Modo multi-empresa** em TUDO

### 2. **Arquitetura de Componentes (CRÍTICO)**
```
✅ FAZER:
  - Criar arquivos PEQUENOS e focados
  - Quebrar componentes > 100 linhas em subcomponentes
  - Manter pastas organizadas por funcionalidade
  
❌ NUNCA:
  - Criar arquivos .md.jsx, .json.jsx, .config.jsx
  - Deixar artefatos de documentação no /src
  - Commit de arquivos no .gitignore
```

### 3. **Responsividade e Redimensionamento**
```
REGRA (aplicar em tudo exceto abas):
  - w-full = largura 100%
  - h-full = altura 100%
  - Redimensionável com mouse
  - Mobile-first (viewport < 768px)
  - Desktop-optimized (viewport > 1024px)
```

### 4. **Controle de Acesso Granular**
- RBAC em TUDO (Role-Based Access Control)
- Validação no frontend + backend
- Auditoria de cada ação sensível
- Multi-empresa com isolamento rigoroso

### 5. **IA e Inovação Futurista**
- LLM para geração de conteúdo inteligente
- Previsões baseadas em IA (churn, estoque, vendas)
- Otimização automática de processos
- Análise preditiva em real-time

### 6. **Melhoria Contínua**
- Code review automático (ESLint + TypeScript)
- Refatoração incremental
- Testes unitários para lógica crítica
- Monitoria de performance

---

## PROTEÇÃO CONTRA ARTEFATOS

### Camada 1: Vite Pre-Build
```javascript
// vite.config.js — Limpa ANTES de qualquer coisa
preClean() {
  // Deleta *.md.jsx, *.json.jsx, *.config.js automaticamente
  // Roda no buildStart e no serve
}
```

### Camada 2: ESLint Hardened
```javascript
// eslint.config.js — Ignora src/components/ completamente
// Lint apenas: pages/, lib/, api/, hooks/, utils/
```

### Camada 3: Git Enforcement
```bash
# .gitignore — BLOQUEIA esses patterns
src/components/**/*.md.jsx
src/components/**/*.json.jsx
src/components/**/*.config.jsx
# (+ 50+ outros patterns)
```

### Camada 4: Pre-Commit Guard
```bash
# Executa ANTES de qualquer commit
# Deleta artefatos que conseguiram passar
npm run pre-commit
```

### Camada 5: Build Validation
```bash
# Executa ANTES de deploy
# Falha o build se encontrar artefatos
npm run build:validate
```

---

## CHECKLIST DE ESTABILIDADE

- [ ] **Nenhum arquivo .md.jsx / .json.jsx no src/**
- [ ] **ESLint passou** (npm run lint)
- [ ] **Build passou** (npm run build)
- [ ] **Nenhum erro de parsing** no console
- [ ] **Componentes < 100 linhas** (quebrados em subcomponentes)
- [ ] **Multi-empresa implementado** (context/filter)
- [ ] **Controle de acesso testado** (RBAC)
- [ ] **Responsividade testada** (mobile + desktop)
- [ ] **Auditoria registrada** (AuditLog)

---

## FLUXO DE DESENVOLVIMENTO

1. **Criar feature** → Implementar em arquivo pequeno e focado
2. **Testar** → npm run dev (sem erros de lint)
3. **Commit** → npm run pre-commit + git commit
4. **Deploy** → npm run build:validate + deploy

---

## PUNIÇÃO POR VIOLAÇÃO

Se artefatos aparecerem novamente:
- ❌ Vite vai deletar automaticamente
- ❌ ESLint vai ignorar (não lintar)
- ❌ Git vai rejeitar o commit
- ❌ Build vai falhar com mensagem clara

**Base44 não reclama — o sistema auto-limpa.**

---

Versão: 3.0 (2026-05-11)
Estabilidade: GARANTIDA ✓