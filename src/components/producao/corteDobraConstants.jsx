export const BITOLAS_DISPONIVEIS = [
  { valor: "4.2", peso_metro: 0.109 },
  { valor: "5.0", peso_metro: 0.154 },
  { valor: "6.3", peso_metro: 0.245 },
  { valor: "8.0", peso_metro: 0.395 },
  { valor: "10.0", peso_metro: 0.617 },
  { valor: "12.5", peso_metro: 0.963 },
  { valor: "16.0", peso_metro: 1.578 },
  { valor: "20.0", peso_metro: 2.466 },
  { valor: "25.0", peso_metro: 3.853 },
  { valor: "32.0", peso_metro: 6.313 },
];

export const FORMATOS_FERRO = [
  { value: "reto", label: "Reto", medidas: ["comprimento"] },
  { value: "U", label: "U (Gancho)", medidas: ["comprimento", "dobra_lado1", "dobra_lado2"] },
  { value: "L", label: "L (90°)", medidas: ["comprimento", "dobra"] },
  { value: "estribo", label: "Estribo Retangular", medidas: ["largura", "altura"] },
  { value: "estribo_circular", label: "Estribo Circular", medidas: ["diametro"] },
  { value: "gancho", label: "Gancho Simples", medidas: ["comprimento", "gancho"] },
  { value: "personalizado", label: "Personalizado", medidas: ["medida1", "medida2", "medida3", "medida4"] },
];

export function calcularPesoBarra(bitola, medidas, formato) {
  const pesoMetro = BITOLAS_DISPONIVEIS.find((b) => b.valor === bitola)?.peso_metro || 0;
  let comprimentoTotal = 0;
  switch (formato) {
    case "reto": comprimentoTotal = medidas.comprimento || 0; break;
    case "U": comprimentoTotal = (medidas.comprimento || 0) + (medidas.dobra_lado1 || 0) + (medidas.dobra_lado2 || 0); break;
    case "L": comprimentoTotal = (medidas.comprimento || 0) + (medidas.dobra || 0); break;
    case "estribo": { const largura = medidas.largura || 0; const altura = medidas.altura || 0; comprimentoTotal = largura * 2 + altura * 2 + 15; break; }
    case "estribo_circular": { const diametro = medidas.diametro || 0; comprimentoTotal = Math.PI * diametro + 15; break; }
    case "gancho": comprimentoTotal = (medidas.comprimento || 0) + (medidas.gancho || 0); break;
    case "personalizado": comprimentoTotal = Object.values(medidas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0); break;
    default: comprimentoTotal = 0;
  }
  return (comprimentoTotal / 100) * pesoMetro;
}

export function calcularResumoGeral(posicoes, quantidade_elementos) {
  const resumo = { peso_total: 0, por_bitola: {}, metros_lineares: 0, quantidade_total_barras: 0 };
  posicoes.forEach((pos) => {
    resumo.peso_total += pos.peso_total || 0;
    resumo.quantidade_total_barras += pos.quantidade_barras * quantidade_elementos;
    if (!resumo.por_bitola[pos.bitola]) resumo.por_bitola[pos.bitola] = { peso: 0, quantidade: 0 };
    resumo.por_bitola[pos.bitola].peso += pos.peso_total || 0;
    resumo.por_bitola[pos.bitola].quantidade += pos.quantidade_barras * quantidade_elementos;
  });
  return resumo;
}