{
  "unidades": [
    {
      "codigo": "UN",
      "nome": "Unidade",
      "abreviacao": "UN",
      "tipo": "Quantidade",
      "conversivel": false,
      "descricao": "Unidade genérica (peças, items)"
    },
    {
      "codigo": "PÇ",
      "nome": "Peça",
      "abreviacao": "PÇ",
      "tipo": "Quantidade",
      "conversivel": true,
      "requer_fator": true,
      "descricao": "Peça individual (ex: 1 barra de 12m)"
    },
    {
      "codigo": "KG",
      "nome": "Quilograma",
      "abreviacao": "kg",
      "tipo": "Peso",
      "conversivel": true,
      "base_estoque": true,
      "descricao": "Quilograma - BASE DO ESTOQUE (V22.0)"
    },
    {
      "codigo": "MT",
      "nome": "Metro",
      "abreviacao": "m",
      "tipo": "Comprimento",
      "conversivel": true,
      "requer_fator": true,
      "descricao": "Metro linear (ex: vergalhão vendido por metro)"
    },
    {
      "codigo": "TON",
      "nome": "Tonelada",
      "abreviacao": "ton",
      "tipo": "Peso",
      "conversivel": true,
      "fator_fixo_kg": 1000,
      "descricao": "Tonelada (1 TON = 1000 KG)"
    },
    {
      "codigo": "BARRA",
      "nome": "Barra",
      "abreviacao": "barra",
      "tipo": "Quantidade",
      "conversivel": true,
      "equivalente": "PÇ",
      "descricao": "Barra de aço (equivalente a Peça)"
    },
    {
      "codigo": "CX",
      "nome": "Caixa",
      "abreviacao": "cx",
      "tipo": "Embalagem",
      "conversivel": false,
      "descricao": "Caixa/embalagem"
    },
    {
      "codigo": "LT",
      "nome": "Litro",
      "abreviacao": "l",
      "tipo": "Volume",
      "conversivel": false,
      "descricao": "Litro (líquidos)"
    },
    {
      "codigo": "M2",
      "nome": "Metro Quadrado",
      "abreviacao": "m²",
      "tipo": "Área",
      "conversivel": false,
      "descricao": "Área"
    },
    {
      "codigo": "M3",
      "nome": "Metro Cúbico",
      "abreviacao": "m³",
      "tipo": "Volume",
      "conversivel": false,
      "descricao": "Volume cúbico"
    }
  ],
  "regras_v22": {
    "regra_mestre": "Estoque sempre em KG para bitolas. Vendas/Compras flexíveis nas unidades_secundarias do produto.",
    "prioridade_conversao": "Sempre converta para KG primeiro, depois para a unidade destino",
    "nfe_obrigatorio": "NF-e DEVE ter peso_total_kg mesmo que venda seja em PÇ ou MT",
    "pdf_formato": "Mostrar: 10 PÇ (115.56 KG) - quantidade + equivalente"
  }
}