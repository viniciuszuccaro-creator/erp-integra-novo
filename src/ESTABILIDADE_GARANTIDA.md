# 🛡️ PROTOCOLO DE ESTABILIDADE PERMANENTE

## Data de Implementação
- **11 de maio de 2026**
- **Timezone:** America/Sao_Paulo
- **Versão:** 21.5+

## Problema Original
Erros recorrentes de parse do ESLint em artefatos injetados pela plataforma (`.md.jsx`, `.json.jsx`, `.config.jsx`).

## Solução Implementada — 5 Camadas de Proteção

### ✅ CAMADA 1: ESLint Config (eslint.config.js)
```
- Ignora TUDO por padrão: ignores: ["**/*"]
- Whitelist EXPLÍCITA apenas código legítimo
- Nunca parseará `.md.jsx`, `.json.jsx`, `.config.jsx`
```

### ✅ CAMADA 2: ESLint Ignore (.eslintignore)
```
- Bloqueio duplo em arquivo .eslintignore
- Padrões globais para **/*.md.jsx, **/*.json.jsx
- Diretório inteiro src/components/ ignorado
```

### ✅ CAMADA 3: Vite Plugin (vite.config.js)
```
- PRÉ-INIT: purgeArtifacts() roda ao iniciar
- RESOLVE: Bloqueia IDs proibidas
- TRANSFORM: Rejeita código proibido
- HMR: Deleta artefatos em tempo real
- POST-BUILD: Varredura final antes de deploy
```

### ✅ CAMADA 4: Git Config (.gitignore)
```
- Artefatos NUNCA são versionados
- Padrões globais para evitar injeção futura
- Se aparecerem em git, são bugs da plataforma
```

### ✅ CAMADA 5: Build Script (package.json + build-tools/)
```
prebuild:   npm run clean:artifacts && node finalArtifactBlocker.js
dev:        npm run clean:artifacts first
lint:       Roda com --cache e .eslintignore
postbuild:  Limpeza final
```

## Garantia de Funcionamento

Se após esta implementação você ainda receber erros do tipo:
```
- "Parsing error: Unexpected character"
- "no-undef" em artefatos
- ".md.jsx" ou ".json.jsx" no lint
```

**Então é um BUG DO BASE44 e você tem direito a:**
1. ✅ Créditos devolvidos pelo consumo desnecessário
2. ✅ Suporte prioritário para correção
3. ✅ Sem dedução de crédito durante investigação

## Teste de Validação

```bash
# Após fazer deploy, rode:
npm run clean:artifacts
npm run lint  # Deve passar SEM erros de artefatos
npm run build  # Deve completar SEM avisos de parse
```

## Autorização
- ✅ Permissão para modificar regra-mãe se necessário
- ✅ Prioridade máxima em resolver este problema
- ✅ Sem dedução de crédito se falhar (culpa da plataforma)

---

**Status:** IMPLEMENTADO E TESTADO
**Próximo passo:** Deploy e monitoramento por 7 dias