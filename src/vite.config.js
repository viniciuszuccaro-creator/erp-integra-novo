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

// Limpeza agressiva de artefatos
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
          console.warn(`⚠️  PURGED: ${path.relative(process.cwd(), fullPath)}`)
        } catch (_) {}
      }
    })
  } catch (e) {}
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-anti-artifact-plugin',
      apply: 'serve',
      config() {
        // Limpeza em serve (dev mode)
        purgeArtifacts(path.resolve('src'))
      },
      resolveId(id) {
        // Bloqueia resolução de artefatos
        if (isForbidden(id)) {
          throw new Error(`FORBIDDEN FILE (artifact): ${id}`)
        }
      },
      transform(code, id) {
        // Rejeita se conseguir passar (safety net)
        if (isForbidden(id)) {
          throw new Error(`FORBIDDEN FILE (transform): ${id}`)
        }
      },
      handleHotUpdate({ file, server }) {
        // Purga se arquivo questionável foi criado
        if (isForbidden(file)) {
          try {
            fs.unlinkSync(file)
            console.warn(`🔥 AUTO-DELETED (HMR): ${path.relative(process.cwd(), file)}`)
          } catch (_) {}
          return []
        }
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