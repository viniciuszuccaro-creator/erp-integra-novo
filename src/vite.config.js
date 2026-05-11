import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Padrões BLOQUEADOS absolutamente
const FORBIDDEN_PATTERNS = [
  /\.(md|txt|rst|adoc|json|yaml|yml)\.(jsx?|tsx?)$/i,
  /\.config\.(jsx?|tsx?)$/i,
  /[A-Z][A-Z0-9_]*(CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida)[^/]*\.(jsx?|tsx?)$/i,
]

const isForbidden = (filePath) => FORBIDDEN_PATTERNS.some(p => p.test(filePath))

// Limpeza agressiva de artefatos (roda a cada mudança)
const purgeArtifacts = (dir) => {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.vite'].includes(entry.name)) {
        purgeArtifacts(fullPath)
      } else if (entry.isFile() && isForbidden(fullPath)) {
        try {
          fs.unlinkSync(fullPath)
          console.warn(`🧹 ELIMINADO PERMANENTEMENTE: ${path.relative(process.cwd(), fullPath)}`)
        } catch (_) {}
      }
    })
  } catch (e) {}
}

// Limpa a cada reinicialização
purgeArtifacts(path.resolve('src'))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-anti-artifact-plugin',
      // apply: sem restrição = roda em SERVE e BUILD
      
      // PRÉ-INICIALIZAÇÃO: Limpar ANTES de qualquer coisa
      config() {
        purgeArtifacts(path.resolve('src'))
        console.log('✅ Limpeza de artefatos completada no startup')
      },
      
      // DURANTE RESOLUÇÃO: Bloquear artefatos
      resolveId(id) {
        if (isForbidden(id)) {
          throw new Error(`[FATAL] BLOQUEADO: ${id}`)
        }
      },
      
      // DURANTE TRANSFORMAÇÃO: Rejeitar se escaparem
      transform(code, id) {
        if (isForbidden(id)) {
          throw new Error(`[FATAL] BLOCKED-TRANSFORM: ${id}`)
        }
      },
      
      // DURANTE HMR: Deletar e recusar
      handleHotUpdate({ file, server }) {
        if (isForbidden(file)) {
          try {
            fs.unlinkSync(file)
            console.warn(`🗑️ DELETADO NO HMR: ${path.relative(process.cwd(), file)}`)
          } catch (_) {}
          return []
        }
      },
      
      // APÓS BUILD: Varredura final
      writeBundle() {
        purgeArtifacts(path.resolve('src'))
        console.log('✅ Limpeza pós-build completada')
      }
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  server: {
    middlewares: [
      (req, res, next) => {
        // Extra safety: bloqueia requisições para artefatos
        const filePath = path.join('src', req.url)
        if (isForbidden(filePath)) {
          res.statusCode = 403
          res.end('FORBIDDEN')
          return
        }
        next()
      }
    ]
  }
})