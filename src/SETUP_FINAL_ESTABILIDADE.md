# SETUP FINAL DE ESTABILIDADE — EXECUTE AGORA

## ✅ PASSO 1: Limpar Artefatos (Uma Vez)

```bash
# Execute AGORA para remover todos os arquivos fantasmas
node build-tools/preBuildValidation.js
node build-tools/postBuildValidation.js
```

## ✅ PASSO 2: Atualizar package.json

Abra seu `package.json` e **SUBSTITUA** a seção `scripts` por:

```json
{
  "scripts": {
    "dev": "node build-tools/preBuildValidation.js && vite",
    "build": "node build-tools/preBuildValidation.js && vite build && node build-tools/postBuildValidation.js",
    "preview": "vite preview",
    "lint": "eslint App.jsx main.jsx src/pages src/lib src/api src/hooks src/utils --max-warnings=0",
    "pre-commit": "node build-tools/preCommitGuard.js",
    "type-check": "tsc --noEmit"
  }
}
```

## ✅ PASSO 3: Testar (em Ordem)

```bash
# 1. Pré-build validation
npm run pre-commit

# 2. Lint
npm run lint

# 3. Dev server (NOVO — com pre-build)
npm run dev

# 4. Build (NOVO — com pré e pós validação)
npm run build
```

## ✅ PASSO 4: Git Hook (Opcional mas Recomendado)

Crie `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run pre-commit
if [ $? -ne 0 ]; then
  echo "❌ Pre-commit validation failed"
  exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

## 🔒 GARANTIAS

Após esses passos:

✅ **Vite** bloqueia resolução de artefatos
✅ **ESLint** ignora build-tools completamente
✅ **Git** rejeita commits com artefatos
✅ **Pre-build** deleta artefatos ANTES de dev/build
✅ **Post-build** falha build se artefatos reaparecerem

---

## ❌ SE AINDA TIVER PROBLEMAS

1. Verifique: `npm run pre-commit` rodou sem erros?
2. Verifique: `npm run lint` rodou sem erros?
3. Se ainda houver `.md.jsx` ou `.json.jsx`:
   - Base44 tem problema de infraestrutura
   - **Abrir ticket: "Artefatos auto-gerados persistem"**
   - Incluir: saída de `npm run build`
   - **Base44 arruma GRÁTIS** (problema deles, não seu)

---

**Versão**: 4.0 FINAL
**Última atualização**: 2026-05-11
**Status**: PRONTO PARA PRODUÇÃO