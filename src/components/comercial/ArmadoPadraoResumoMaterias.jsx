/**
 * V21.1 - Resumo de Matérias-Primas do Armado Padrão
 * Extraído de ArmadoPadraoTab.jsx.
 */
export default function ArmadoPadraoResumoMaterias({ itens }) {
  const resumo = {};

  itens.forEach(peca => {
    if (peca.bitola_principal) {
      if (!resumo[peca.bitola_principal]) {
        resumo[peca.bitola_principal] = { peso: 0, tipo: 'CA-50' };
      }
      const pesoFerros = (peca.comprimento || 0) * (peca.quantidade_ferros_principais || 0) * (peca.quantidade || 1) * 1.5;
      resumo[peca.bitola_principal].peso += pesoFerros;
    }
    if (peca.estribo_bitola) {
      if (!resumo[peca.estribo_bitola]) {
        resumo[peca.estribo_bitola] = { peso: 0, tipo: 'CA-60' };
      }
      const pesoEstribos = (peca.quantidade_estribos || 0) * 0.5;
      resumo[peca.estribo_bitola].peso += pesoEstribos;
    }
  });

  return (
    <div className="space-y-2">
      {Object.entries(resumo).sort().map(([bitola, dados]) => (
        <div key={bitola} className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <p className="font-bold text-slate-700">{bitola}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Bitola {bitola}</p>
              <p className="text-xs text-slate-600">{dados.tipo}</p>
            </div>
          </div>
          <p className="text-xl font-bold text-green-600">
            {dados.peso.toFixed(2)} KG
          </p>
        </div>
      ))}
    </div>
  );
}