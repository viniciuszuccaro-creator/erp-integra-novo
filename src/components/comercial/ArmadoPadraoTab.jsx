import React, { useState } from 'react';
import { useRLSQuery } from '@/components/lib/useRLSQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useArmadoPadraoCalculo } from '@/components/comercial/useArmadoPadraoCalculo';
import ArmadoPadraoFormFields from '@/components/comercial/ArmadoPadraoFormFields';
import ArmadoPadraoListaPecas from '@/components/comercial/ArmadoPadraoListaPecas';
import ArmadoPadraoResumoMaterias from '@/components/comercial/ArmadoPadraoResumoMaterias';

/**
 * V21.1 - Aba 3: Armado Padrão
 * AGORA COM: etapa_obra_id + Consolidação por Etapa
 * Refatorado: lógica → useArmadoPadraoCalculo, UI → sub-componentes
 */
export default function ArmadoPadraoTab({ formData, setFormData, empresaId, onNext }) {
  const {
    tipoPeca, setTipoPeca,
    dadosPeca, setDadosPeca,
    pecaEditandoIndex,
    tiposPeca, etapasObra,
    adicionarOuEditarPeca, removerPeca, editarPeca, cancelarEdicao,
    consolidarPorEtapa, gerarItensComerciais
  } = useArmadoPadraoCalculo({ formData, setFormData, onNext });

  const { data: bitolas = [] } = useRLSQuery(
    'Produto', { eh_bitola: true, status: 'Ativo' }, '-descricao', 200,
    { enabled: !!(empresaId || formData?.empresa_id || formData?.group_id) }
  );

  return (
    <div className="space-y-6">
      {/* Seleção de Tipo */}
      {!tipoPeca && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selecione o Tipo de Peça</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tiposPeca.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoPeca(tipo.id)}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-5xl mb-3">{tipo.icon}</div>
                  <p className="font-bold text-lg text-slate-900 group-hover:text-blue-600">{tipo.label}</p>
                  <p className="text-xs text-slate-600 mt-1">{tipo.descricao}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário Dinâmico */}
      {tipoPeca && (
        <ArmadoPadraoFormFields
          tipoPeca={tipoPeca}
          setTipoPeca={setTipoPeca}
          dadosPeca={dadosPeca}
          setDadosPeca={setDadosPeca}
          bitolas={bitolas}
          tiposPeca={tiposPeca}
          etapasObra={etapasObra}
          pecaEditandoIndex={pecaEditandoIndex}
          onAdicionar={adicionarOuEditarPeca}
          onTrocarTipo={() => { setTipoPeca(null); setDadosPeca({}); }}
          onCancelarEdicao={cancelarEdicao}
        />
      )}

      {/* Lista de Peças */}
      <ArmadoPadraoListaPecas
        itens={formData.itens_armado_padrao}
        onEditar={editarPeca}
        onRemover={removerPeca}
        onConsolidar={consolidarPorEtapa}
        onGerarComerciais={gerarItensComerciais}
      />

      {/* Resumo de Bitolas */}
      {formData.itens_armado_padrao && formData.itens_armado_padrao.length > 0 && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader className="bg-green-100 border-b">
            <CardTitle className="text-base">📊 Resumo de Matéria-Prima (Armado Padrão)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ArmadoPadraoResumoMaterias itens={formData.itens_armado_padrao} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}