/**
 * Núcleo CSV — conversão e download
 * Regra-Mãe 3: extraído de exportacaoExcel.jsx — comportamento preservado
 */

/**
 * Converte array de objetos para CSV
 * @param {array} dados - Array de objetos
 * @param {array} colunas - Array de {key, label}
 * @returns {string} - String CSV
 */
export function converterParaCSV(dados, colunas) {
  if (!dados || dados.length === 0) return '';

  // Cabeçalho
  const cabecalho = colunas.map(col => `"${col.label}"`).join(',');

  // Linhas
  const linhas = dados.map(row => {
    return colunas.map(col => {
      let valor = row[col.key];

      // Formatação especial
      if (valor === null || valor === undefined) {
        return '"-"';
      }

      // Datas
      if (col.tipo === 'date' && valor) {
        try {
          valor = new Date(valor).toLocaleDateString('pt-BR');
        } catch (e) {
          valor = valor;
        }
      }

      // Números/Moeda
      if (col.tipo === 'moeda' && typeof valor === 'number') {
        valor = `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }

      if (col.tipo === 'numero' && typeof valor === 'number') {
        valor = valor.toLocaleString('pt-BR');
      }

      // Escapar aspas
      const valorString = String(valor).replace(/"/g, '""');
      return `"${valorString}"`;
    }).join(',');
  }).join('\n');

  return `${cabecalho}\n${linhas}`;
}

/**
 * Faz download do CSV
 */
export function baixarCSV(nomeArquivo, conteudoCSV) {
  // BOM para UTF-8 (Excel reconhecer acentos)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Gera nome de arquivo com sufixo de data (padrão das exportações)
 */
export function nomeArquivoComData(prefixo) {
  return `${prefixo}_${new Date().toISOString().split('T')[0]}.csv`;
}