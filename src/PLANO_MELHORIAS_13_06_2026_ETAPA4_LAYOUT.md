# ETAPA 4 — Prioridade 4: Layout & Fluidez
**Data:** 13/06/2026 | **Status:** ✅ Iniciada

## 📋 OBJETIVO
Simplificar dashboards (remover excesso de cards), aplicar w-full/h-full, scroll interno fluido.

---

## 1️⃣ PRINCÍPIOS

✅ **w-full h-full** em todas as screens  
✅ **Scroll interno por container** (não page-level)  
✅ **Máx 6-8 KPIs principais** (remover redundância)  
✅ **Lazy-load** para abas e sections pesadas  
✅ **Componentes redimensionáveis** (exceto abas)  

---

## 2️⃣ DASHBOARDS A SIMPLIFICAR

### Dashboard (Principal)
**Atual:** 15+ cards (KPIs + Vendas + Estoque + Financeiro + RH)  
**Alvo:** 6-8 cards (KPIs essenciais apenas)  

**Remover:**
- Widgets duplicados (ex: duas visões de "Vendas Hoje")
- Cards com <5% interação
- Gráficos muito densos

**Manter:**
- KPIs Críticos (Faturamento, Pedidos, Estoque Crítico)
- Alertas Urgentes
- Próximas Ações

### DashboardFinanceiroRealtime
**Atual:** 600+ linhas (compacto)  
**Status:** ✅ Já refatorado → DashboardFinanceiroRealtimeCompacto

### DashboardCorporativo
**Atual:** Muitos cards de consolidação  
**Alvo:** Abas por empresa + 3-4 gráficos comparativos

---

## 3️⃣ IMPLEMENTAÇÃO

### Padrão w-full h-full:
```jsx
export default function Dashboard() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header - sticky */}
      <div className="flex-shrink-0">Header</div>
      
      {/* Content - scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-4 p-6">
          {/* Cards here */}
        </div>
      </div>
    </div>
  );
}
```

### Lazy-Load em Abas:
```jsx
import { Suspense, lazy } from 'react';

const HistoricoTab = lazy(() => import('./HistoricoTab'));

<TabsContent value="historico">
  <Suspense fallback={<div className="h-32 animate-pulse bg-slate-200" />}>
    <HistoricoTab />
  </Suspense>
</TabsContent>
```

---

## 4️⃣ CHECKLIST ETAPA 4

### Layout:
- [x] Princípios documentados
- [ ] Dashboard (Principal) — simplificar a 8 cards máx
- [ ] DashboardCorporativo — refatorar em abas
- [ ] Comercial → simplificar cards redundantes
- [ ] Financeiro → consolidar visões

### Fluidez:
- [ ] Validar scroll interno em todas as sections
- [ ] Lazy-load em abas pesadas
- [ ] Remover reflows desnecessários
- [ ] Performance: <100ms no render de cards

---

## 5️⃣ MÉTRICAS DE SUCESSO

✅ Dashboard carrega em <2s  
✅ Scroll suave (60 FPS)  
✅ <6 cards visíveis por dashboard  
✅ Sem cards com <1% CTR  
✅ Abas lazy-load: -40% memory  

---

## 6️⃣ PRÓXIMOS PASSOS
**ETAPA 5 — Administração do Sistema** consolidará Cadastros Gerais e removará duplicidades.