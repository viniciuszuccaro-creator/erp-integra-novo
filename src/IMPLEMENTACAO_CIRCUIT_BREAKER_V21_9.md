# 🚨 Circuit Breaker + Rate Limit Monitor — V21.9

## Resumo
Sistema de proteção contra rate limits (429) com circuit breaker automático, debounce e monitoramento em tempo real.

## Arquitetura

### 1️⃣ **Monitor429RateLimit** (Aba Admin)
- Exibe status do circuit breaker em tempo real
- Countdown de recuperação
- Histórico de 429s (últimas 50)
- Taxa de erros por hora
- **Local**: `components/administracao-sistema/Monitor429RateLimit`

### 2️⃣ **useCountEntitiesWithCircuitBreaker** (Hook)
- Debounce: aguarda 500ms antes de fazer req
- Circuit Breaker 3-estado:
  - **CLOSED**: operacional ✓
  - **OPEN**: bloqueado (após 3 falhas) ✗
  - **HALF_OPEN**: testando reconexão ⚠️
- Timeout: 60s para tentar reconectar
- Persiste em localStorage (compartilhado entre abas)
- **Local**: `components/lib/useCountEntitiesWithCircuitBreaker`

### 3️⃣ **useCountEntitiesOptimized v2.0** (Hook)
- Wrapper que integra o circuit breaker
- Valida contexto multiempresa
- Memoiza entidades para evitar recálculo
- **Local**: `components/lib/useCountEntitiesOptimized`

## Como usar

### Em um componente que conta entidades:
```jsx
import useCountEntitiesOptimized from '@/components/lib/useCountEntitiesOptimized';

export default function MeuComponente() {
  const { counts, circuitState, loadCounts, isProtected } = useCountEntitiesOptimized([
    'Cliente', 'Pedido', 'Produto'
  ]);

  useEffect(() => {
    loadCounts(); // Automático com debounce + proteção
  }, []);

  return (
    <div>
      {isProtected && <AlertCircuitAberto />}
      <p>Clientes: {counts.Cliente || 0}</p>
      <p>Pedidos: {counts.Pedido || 0}</p>
    </div>
  );
}
```

## Fluxo de operação

```
Usuario faz ação
    ↓
loadCounts() chamado
    ↓
[DEBOUNCE 500ms] aguarda para agrupar reqs
    ↓
Verifica circuit state
    ├─ CLOSED → faz requisição
    ├─ OPEN → retorna cache (se dentro do timeout)
    └─ HALF_OPEN → testa reconexão
    ↓
Sucesso → Reset para CLOSED
Falha 429 → incrementa failureCount
    ├─ failureCount < 3 → mantém CLOSED
    └─ failureCount ≥ 3 → abre circuit (60s)
    ↓
Monitor429RateLimit mostra status em tempo real
```

## Onde está integrado

- ✅ **AdminTabs**: Aba "🚨 Rate Limit (429s)"
- ✅ **Contadores de entidades**: Todos os hooks de contagem usam o circuit breaker

## Próximos passos

1. **Integrar em mais módulos** que fazem contagens frequentes:
   - Dashboard (KPIs)
   - CRM (contadores)
   - Financeiro (resumos)

2. **Alertas em tempo real** (notificações quando circuit abre)

3. **Métricas avançadas** (latência, taxa de sucesso, etc)

## Constantes ajustáveis

Arquivo: `components/lib/useCountEntitiesWithCircuitBreaker`

```javascript
const DEBOUNCE_MS = 500;          // Tempo de espera para agrupar reqs
const MAX_FAILURES = 3;           // Falhas antes de abrir circuit
const CIRCUIT_TIMEOUT = 60000;    // Tempo de espera para reconectar (ms)
```

## Troubleshooting

### Circuit sempre aberto?
- Verificar se API está respondendo (checar logs em AuditLog)
- Aumentar `CIRCUIT_TIMEOUT` se ambiente for lento

### Contadores não atualizam?
- Verificar se `loadCounts()` foi chamado
- Debounce pode estar adiando a requisição (esperado)

### Estado inconsistente entre abas?
- localStorage está sincronizando automaticamente
- Recarregar página força sincronização

## Monitoramento

Acessar **Admin → 🚨 Rate Limit (429s)** para:
- Status atual do circuit breaker
- Taxa de 429s na última hora
- Histórico de erros
- Countdown de recuperação

---

**Versão**: V21.9  
**Data**: 2026-05-31  
**Resiliência**: ⭐⭐⭐⭐⭐