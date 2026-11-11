# IMPLANTAÇÃO DO COMERCIAL 360° — FASES 1 A 7 (11/11/2026)

Conclusão da implantação do dossiê ERP_ZUCCARO_COMERCIAL_360 sobre o que já existia.
Nenhum módulo, tela ou entidade nova foi criada: todas as entregas são evoluções da Central de Vendas 360°
e dos componentes do Comercial, conforme a Regra-Mãe.

## Fase 1 — Auditoria
`RELATORIO_AUDITORIA_COMERCIAL_360_11_11_2026.md` — inventário do que existia e classificação das lacunas.

## Fase 2 — Busca universal e peso total
- Busca universal com escopo de servidor: `useRLSQuery` repassa o termo ao `filterInContext` →
  `entityListSorted` (SEARCH_FIELDS por entidade), com espera de digitação e carga dos pedidos encontrados
  fora da página atual (`useCentral360Data`, `pedidosBase`).
- Coluna **Peso total**: usa o peso do documento quando existe e, quando não, calcula pelos cadastros
  oficiais de Produto (`pesoNegociacao.jsx`, `usePesosProdutos.jsx`), com legenda da origem no cabeçalho da célula.

## Fase 3 — Motor de validação de fechamento
- `useValidacaoFechamento.jsx` — regras de cliente/documento/contato, itens, quantidades, preços,
  saldo oficial de estoque, desconto concedido, condição de pagamento e validade da proposta.
- `PainelValidacaoFechamento.jsx` — resultado explicativo na mesa (OK / atenção / bloqueio), com detalhe por regra.
- A ação de avançar a negociação fica bloqueada quando há bloqueio estrutural em orçamento, e o rodapé
  explica o motivo.

## Fase 4 — Copiloto comercial e alertas proativos
- `useAlertasComerciais.jsx` — proposta vencida/vencendo, aprovação parada, negociação sem movimento;
  calculado sobre as negociações já carregadas (sem consulta adicional).
- Contador de alertas no cabeçalho da Central.
- `paineis/PainelCopiloto.jsx` — lista de alertas navegável (abre a negociação) e análise assistida da
  negociação via `InvokeLLM`, com auditoria em `AuditLog` e registro do contexto de grupo/empresa.

## Fase 5 — Mapa de entregas e contadores de janela
- `paineis/PainelMapaEntregas.jsx` — entregas reais da negociação/cliente, contadores por situação e por
  **janela de entrega** (manhã/tarde/noite) e mapa com as coordenadas do endereço de entrega.

## Fase 6 — RBAC granular em ação sensível
- `useAcoesComerciais.jsx` centraliza as permissões do submódulo Comercial/Pedidos.
- Desconto acima do limite (15%) passa a exigir permissão de aprovação: campo de desconto bloqueado
  (`ItensNegociacaoGrid`) e gravação recusada com registro de auditoria de bloqueio.

## Fase 7 — Preferências no registro do usuário
- `usePreferenciasCentral360.jsx` persiste larguras, ordenação, filtros e largura do painel em
  `central360_prefs` do usuário (`updateMe`, com debounce); o armazenamento local permanece só como cache.

## Pendências residuais (não bloqueiam o Comercial)
- Amarração definitiva do canal WhatsApp do Hub de Atendimento ao atendimento comercial.
- Automação da fila de validação de pedidos externos (`ValidarPedidosExternos`).
- Roteirização com otimização por IA incorporada à Central (hoje o mapa é informativo; a otimização
  permanece na Expedição).
- Testes E2E das interações da Central (requer agente de testes).
