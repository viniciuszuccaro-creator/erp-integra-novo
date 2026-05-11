# 📐 V22.0: REGRA MESTRE DE CONVERSÃO DE UNIDADES

## 🎯 **Objetivo:**
Permitir **fluidez total** entre Vendas (PÇ/MT), Estoque (KG) e Compras (TON) sem perder rastreabilidade financeira e fiscal.

---

## 🧱 **REGRA DE OURO:**

> **ESTOQUE É SEMPRE EM KG (para bitolas)**  
> **VENDAS/COMPRAS podem ser em qualquer unidade habilitada**  
> **SISTEMA CONVERTE AUTOMATICAMENTE usando `fatores_conversao`**

---

## 📊 **EXEMPLO PRÁTICO:**

### Produto: **Vergalhão 8mm 12m CA-50**

**Configuração no Cadastro (ProdutoForm):**
```json
{
  "descricao": "Vergalhão 8mm 12m CA-50",
  "eh_bitola": true,
  "peso_teorico_kg_m": 0.395,
  "comprimento_barra_padrao_m": 12,
  "unidade_principal": "KG",
  "unidades_secundarias": ["PÇ", "KG", "MT"],
  "fatores_conversao": {
    "kg_por_peca": 4.74,      // 0.395 * 12
    "kg_por_metro": 0.395,
    "metros_por_peca": 12,
    "peca_por_ton": 210.97,   // 1000 / 4.74
    "kg_por_ton": 1000
  }
}
```

---

## 🔄 **CONVERSÕES AUTOMÁTICAS:**

| Operação | Usuário Digita | Sistema Converte | Estoque Atualiza |
|----------|---------------|------------------|------------------|
| **Venda** | 10 PÇ | → 47.40 KG | -47.40 KG |
| **Venda** | 50 MT | → 19.75 KG | -19.75 KG |
| **Compra** | 1 TON | → 1000 KG | +1000 KG |
| **Compra** | 200 PÇ | → 948 KG | +948 KG |

---

## 📦 **ONDE É USADO:**

### 1️⃣ **Módulo Comercial (Vendas)**
```jsx
import SeletorUnidadeComConversao from '@/components/comercial/SeletorUnidadeComConversao';

<SeletorUnidadeComConversao
  produto={produtoSelecionado}
  onChange={(qtd, unidade, pesoKG) => {
    // pesoKG já vem calculado automaticamente
    adicionarItem({ quantidade: qtd, unidade, peso_kg: pesoKG });
  }}
/>
```

**Resultado no Pedido:**
- Cliente vê: **10 PÇ** (forma de venda)
- Sistema grava: **quantidade: 10, unidade: 'PÇ', peso_equivalente_kg: 47.40**
- Estoque baixa: **-47.40 KG**

---

### 2️⃣ **Módulo Compras**
```jsx
<SeletorUnidadeComConversao
  produto={produtoSelecionado}
  onChange={(qtd, unidade, pesoKG) => {
    // Compra de 1 TON
    // Sistema converte para 1000 KG automaticamente
  }}
/>
```

**Resultado na Ordem de Compra:**
- Fornecedor vê: **1 TON** (forma de compra)
- Sistema grava: **quantidade: 1, unidade: 'TON', peso_equivalente_kg: 1000**
- Estoque entra: **+1000 KG**

---

### 3️⃣ **Módulo Estoque**
```javascript
import { converterParaKG } from '@/components/lib/CalculadoraUnidades';

// Em qualquer movimentação
const pesoKG = converterParaKG(quantidade, unidade, produto);

await base44.entities.MovimentacaoEstoque.create({
  quantidade_original: quantidade,
  unidade_original: unidade,
  peso_equivalente_kg: pesoKG, // ← SEMPRE gravado
  estoque_atual: estoqueAnterior - pesoKG // ← SEMPRE em KG
});
```

---

### 4️⃣ **NF-e (Nota Fiscal)**
```jsx
import { calcularPesoTotalNFe, ExibirEquivalenteKG } from '@/components/lib/CalculadoraUnidades';

// Itens da NF-e
itens.map(item => (
  <tr>
    <td>{item.descricao}</td>
    <td>{item.quantidade} {item.unidade}</td>
    <td>
      <ExibirEquivalenteKG 
        quantidade={item.quantidade} 
        unidade={item.unidade} 
        produto={item.produto} 
      />
    </td>
  </tr>
))

// Peso total obrigatório SEFAZ
const pesoTotalKG = calcularPesoTotalNFe(itens);
```

**XML NF-e gerado:**
```xml
<det nItem="1">
  <prod>
    <cProd>VER-8MM</cProd>
    <xProd>Vergalhão 8mm 12m CA-50</xProd>
    <qCom>10</qCom>
    <uCom>PÇ</uCom>
    <vUnCom>25.00</vUnCom>
    <pesoLiq>47.40</pesoLiq> <!-- ← CONVERSÃO AUTOMÁTICA -->
  </prod>
</det>
```

---

### 5️⃣ **Relatórios e Dashboards**
```javascript
// Dashboard de Estoque
const estoqueKG = produto.estoque_atual; // sempre em KG
const estoquePeca = converterUnidade(estoqueKG, 'KG', 'PÇ', produto);
const estoqueMetro = converterUnidade(estoqueKG, 'KG', 'MT', produto);

// Exibir todas as visões
<div>
  <p>Estoque: {estoqueKG.toFixed(2)} KG</p>
  <p>Equivalente: {estoquePeca.toFixed(0)} PÇ ou {estoqueMetro.toFixed(2)} MT</p>
</div>
```

---

## ⚙️ **FUNÇÕES DISPONÍVEIS:**

### `converterUnidade(quantidade, de, para, produto)`
Converte entre quaisquer unidades.

```javascript
import { converterUnidade } from '@/components/lib/CalculadoraUnidades';

const pesoKG = converterUnidade(10, 'PÇ', 'KG', produto);
// 10 PÇ → 47.40 KG (se peso_teorico_kg_m = 0.395 e barra = 12m)
```

---

### `converterParaKG(quantidade, unidade, produto)`
Atalho para converter para KG (base do estoque).

```javascript
import { converterParaKG } from '@/components/lib/CalculadoraUnidades';

const pesoKG = converterParaKG(10, 'PÇ', produto);
// 10 PÇ → 47.40 KG
```

---

### `<ExibirEquivalenteKG />`
Componente visual para mostrar equivalente.

```jsx
import { ExibirEquivalenteKG } from '@/components/lib/CalculadoraUnidades';

<ExibirEquivalenteKG quantidade={10} unidade="PÇ" produto={produto} />
// Renderiza: "≈ 47.40 KG"
```

---

### `<PreviewConversao />`
Preview completo de todas conversões.

```jsx
import { PreviewConversao } from '@/components/lib/CalculadoraUnidades';

<PreviewConversao quantidade={10} unidadeOrigem="PÇ" produto={produto} />
// Renderiza card com: 47.40 KG, 120 MT
```

---

### `validarConversao(produto, unidade)`
Valida se uma conversão é possível.

```javascript
import { validarConversao } from '@/components/lib/CalculadoraUnidades';

const { valido, mensagem } = validarConversao(produto, 'MT');
if (!valido) {
  alert(mensagem); // "Produto sem peso teórico configurado"
}
```

---

### `gerarOpcoesUnidades(produto)`
Gera opções de dropdown dinamicamente.

```javascript
import { gerarOpcoesUnidades } from '@/components/lib/CalculadoraUnidades';

const opcoes = gerarOpcoesUnidades(produto);
// [{ value: 'PÇ', label: 'PÇ - Peça' }, { value: 'KG', label: 'KG - Quilograma' }, ...]
```

---

## 🚨 **REGRAS CRÍTICAS:**

1. ✅ **Estoque SEMPRE em KG** (para bitolas) → rastreamento financeiro preciso
2. ✅ **NF-e SEMPRE tem peso_total_kg** → conformidade SEFAZ
3. ✅ **Vendas/Compras flexíveis** → UX amigável para vendedor e comprador
4. ✅ **Conversão bidirecional** → PÇ ↔ KG ↔ MT ↔ TON
5. ✅ **Validação automática** → Bloqueia se conversão impossível

---

## 📄 **IMPRESSÃO DE PEDIDO/NF-e (V22.0):**

**Layout do PDF:**

| Item | Qtde | Unid | Equiv. KG | Vlr Unit | Total |
|------|------|------|-----------|----------|-------|
| Vergalhão 8mm CA-50 | 10 | PÇ | **47.40 KG** | R$ 25,00/PÇ | R$ 250,00 |
| Barra 10mm CA-50 | 50 | MT | **30.85 KG** | R$ 8,50/MT | R$ 425,00 |

**Totais:**
- **Peso Total NF-e: 78.25 KG** ← Obrigatório SEFAZ
- **Valor Total: R$ 675,00**

---

## 🎯 **PRÓXIMOS PASSOS (V22.1):**

1. ✅ Implementar `SeletorUnidadeComConversao` no **PedidoFormCompleto.jsx**
2. ✅ Implementar `SeletorUnidadeComConversao` no **OrdemCompraForm.jsx**
3. ✅ Atualizar **MovimentacaoEstoque** para gravar `peso_equivalente_kg`
4. ✅ Atualizar **Gerador de NF-e** para incluir `<pesoLiq>`
5. ✅ Criar **template PDF** com coluna "Equiv. KG"

---

**Desenvolvido por: Base44 AI • Versão: 22.0 • Data: 2025-01-09**