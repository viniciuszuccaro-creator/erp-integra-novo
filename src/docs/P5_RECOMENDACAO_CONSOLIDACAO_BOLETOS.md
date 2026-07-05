# P5 — Recomendação de Consolidação: ConfiguracaoBoletos → ConfiguracaoCobrancaEmpresa

**Data:** 2026-07-05
**Status:** Recomendação registrada (aguardando confirmação para execução)

## Análise

| Aspecto | ConfiguracaoBoletos | ConfiguracaoCobrancaEmpresa |
|---|---|---|
| **Campos** | 18 campos | 35+ campos (superset) |
| **Imports ativos** | 2 (CentralIntegracoes, StatusIntegracoes) | 0 (órfã) |
| **Recursos** | Boleto + PIX básico | Boleto + PIX + Cartão + Split + OAuth + Webhook token |
| **Maturidade** | Em uso (dados ativos) | Schema completo mas sem dados |

## Recomendação

**Consolidar ConfiguracaoBoletos → ConfiguracaoCobrancaEmpresa** pois:
1. ConfiguracaoCobrancaEmpresa é o superset (contém todos os campos + extras)
2. Suporta PIX, Cartão, Split de pagamento (marketplace), OAuth
3. Tem campos de controle de conexão (status_conexao, mensagem_erro)
4. Evita duplicação de propósito entre duas entidades

## Plano de Migração (3 etapas)

### Etapa 1: Mapear campos
| ConfiguracaoBoletos | ConfiguracaoCobrancaEmpresa |
|---|---|
| `provedor` | `provedor_cobranca` |
| `api_url` | `api_url` |
| `api_key` | `api_key` |
| `wallet_id` | `conta_id` |
| `ambiente` | `modo_simulacao` (Sandbox→true, Produção→false) |
| `gerar_boleto_automatico` | `habilitar_boleto` |
| `gerar_pix_automatico` | `habilitar_pix` |
| `dias_vencimento_padrao` | `dias_vencimento_padrao` |
| `multa_percentual` | `multa_pos_vencimento_percent` |
| `juros_diario_percentual` | `juros_ao_dia_percent` |
| `desconto_antecipacao_percentual` | `desconto_antecipacao_percent` |
| `enviar_email_cobranca` | `enviar_email_automatico` |
| `enviar_whatsapp_cobranca` | `enviar_whatsapp_automatico` |
| `webhook_url` | `webhook_url` |
| `ativo` | `ativo` |

### Etapa 2: Atualizar componentes
- `ConfiguracaoBoletosForm.jsx` → adaptar field names para ConfiguracaoCobrancaEmpresa
- `CentralIntegracoes.jsx` → trocar `base44.entities.ConfiguracaoBoletos` por `ConfiguracaoCobrancaEmpresa`
- `StatusIntegracoes.jsx` → mesmo

### Etapa 3: Migrar dados + desativar
- Criar função backend `migrateBoletosToCobranca` (copia registros)
- Após validação, desativar entidade ConfiguracaoBoletos (manter schema para histórico)

## Risco
- **Baixo:** Form é presentacional (recebe config, chama onSubmit)
- **Médio:** Migração de dados existentes (requere função backend)
- **Impacto:** 2 arquivos importam o form (CentralIntegracoes, StatusIntegracoes)

## Decisão necessária
Confirmar execução da migração OU manter ambas coexistindo (status quo).