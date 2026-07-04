import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Download, ChevronRight, Box, Layers, ArrowRight, Pencil } from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.1 - Aba 3: Armado Padrão
 * AGORA COM: etapa_obra_id + Consolidação por Etapa
 */
export default function ArmadoPadraoTab({ formData, setFormData, empresaId, onNext }) {
  const [tipoPeca, setTipoPeca] = useState(null);
  const [dadosPeca, setDadosPeca] = useState({});
  const [pecaEditandoIndex, setPecaEditandoIndex] = useState(null);

  const { data: bitolas = [] } = useQuery({
    queryKey: ['bitolas', empresaId || formData?.empresa_id],
    queryFn: async () => {
      const empId = empresaId || formData?.empresa_id;
      const filter = empId 
        ? { empresa_id: empId, eh_bitola: true, status: 'Ativo' }
        : { eh_bitola: true, status: 'Ativo' };
      return await base44.entities.Produto.filter(filter);
    },
    enabled: true
  });

  const tiposPeca = [
    { 
      id: 'coluna', 
      label: 'Coluna', 
      icon: '🏛️',
      descricao: 'Coluna retangular com estribos'
    },
    { 
      id: 'viga', 
      label: 'Viga', 
      icon: '📏',
      descricao: 'Viga retangular com estribos'
    },
    { 
      id: 'estaca', 
      label: 'Estaca/Broca', 
      icon: '🔩',
      descricao: 'Estaca com estribo circular'
    },
    { 
      id: 'bloco', 
      label: 'Bloco', 
      icon: '🧱',
      descricao: 'Bloco de coroamento/fundação'
    }
  ];

  const calcularPeca = () => {
    let resultado = {
      ...dadosPeca,
      tipo_peca: tipoPeca,
      identificador: dadosPeca.identificador || `${tipoPeca.toUpperCase()}-${Date.now()}`,
      quantidade: dadosPeca.quantidade || 1,
      etapa_obra_id: dadosPeca.etapa_obra_id || '',
      etapa_obra_nome: dadosPeca.etapa_obra_nome || '',
      quantidade_ferros_principais: dadosPeca.quantidade_ferros_principais || 4,
      bitola_principal: dadosPeca.bitola_principal || '',
      reforco_bitola: dadosPeca.reforco_bitola || '',
      reforco_quantidade: dadosPeca.reforco_quantidade || 0,
      estribo_bitola: dadosPeca.estribo_bitola || '',
      estribo_largura: dadosPeca.estribo_largura || 0,
      estribo_altura: dadosPeca.estribo_altura || 0,
      distancia_estribo: dadosPeca.distancia_estribo || 20
    };

    // Cálculos específicos por tipo
    if (tipoPeca === 'coluna' || tipoPeca === 'viga') {
      const comprimento = dadosPeca.comprimento || 0;
      const distanciaEstribo = dadosPeca.distancia_estribo || 20;
      
      // Qtde de estribos
      const qtdeEstribos = Math.ceil((comprimento * 100) / distanciaEstribo);
      
      resultado.estribo_quantidade = qtdeEstribos;
      resultado.quantidade_estribos = qtdeEstribos * resultado.quantidade;
      
      // Reforço
      const reforco = dadosPeca.reforco_bitola ? ` + ${dadosPeca.reforco_quantidade || 0} ferros ${dadosPeca.reforco_bitola}` : '';
      resultado.reforco_descricao = reforco;
    }

    if (tipoPeca === 'estaca') {
      const comprimento = dadosPeca.comprimento || 0;
      const distanciaEstribo = dadosPeca.distancia_estribo || 20;
      const qtdeEstribos = Math.ceil((comprimento * 100) / distanciaEstribo);
      
      resultado.estribo_quantidade = qtdeEstribos;
      resultado.quantidade_estribos = qtdeEstribos * resultado.quantidade;
    }

    if (tipoPeca === 'bloco') {
      // Cálculo automático de ferros
      const comprimentoCm = dadosPeca.comprimento || 0;
      const alturaCm = dadosPeca.altura || 0;
      const larguraCm = dadosPeca.largura || 0;
      const espacamento = dadosPeca.espacamento || 15;

      const ferrosLado1 = Math.ceil(comprimentoCm / espacamento) + 1;
      const ferrosLado2 = Math.ceil(larguraCm / espacamento) + 1;
      const costelas = Math.floor(larguraCm / 30) || 0; // A cada 30cm uma costela

      resultado.ferros_lado1 = ferrosLado1;
      resultado.ferros_lado2 = ferrosLado2;
      resultado.costelas_quantidade = costelas;
      resultado.bitola_costela = dadosPeca.bitola_principal; // Mesma bitola
    }

    // Gerar descrição automática
    const descricao = gerarDescricaoTecnica(resultado);
    resultado.descricao_automatica = descricao;

    // Calcular peso (simplificado - em produção usar tabela de peso/metro)
    const pesoEstimado = estimarPeso(resultado, bitolas);
    resultado.peso_total_kg = pesoEstimado;

    // Calcular preço (R$/kg configurável)
    const precoPorKg = 8.50; // Configurável por empresa
    resultado.preco_venda_total = pesoEstimado * precoPorKg;

    return resultado;
  };

  const gerarDescricaoTecnica = (peca) => {
    const etapaTexto = peca.etapa_obra_nome ? ` [${peca.etapa_obra_nome}]` : '';
    
    if (peca.tipo_peca === 'coluna' || peca.tipo_peca === 'viga') {
      return `${peca.quantidade} ${peca.tipo_peca.toUpperCase()}${etapaTexto} de ${peca.comprimento}m — ` +
        `${peca.quantidade_ferros_principais || 0} ferros ${peca.bitola_principal}` +
        `${peca.reforco_descricao || ''} — ` +
        `Estribo ${peca.estribo_largura}x${peca.estribo_altura}cm (${peca.estribo_bitola}) a cada ${peca.distancia_estribo}cm`;
    }

    if (peca.tipo_peca === 'estaca') {
      return `${peca.quantidade} ESTACA${etapaTexto} de ${peca.comprimento}m — ` +
        `${peca.quantidade_ferros_principais || 0} ferros ${peca.bitola_principal}mm — ` +
        `Estribo Ø${peca.estribo_diametro}cm (${peca.estribo_bitola}mm) a cada ${peca.distancia_estribo}cm`;
    }

    if (peca.tipo_peca === 'bloco') {
      return `${peca.quantidade} BLOCO${etapaTexto} ${peca.comprimento}x${peca.largura}x${peca.altura}cm — ` +
        `${peca.ferros_lado1} ferros lado 1 + ${peca.ferros_lado2} ferros lado 2 — ` +
        `Bitola ${peca.bitola_principal}mm`;
    }

    return peca.identificador;
  };

  const estimarPeso = (peca, bitolas) => {
    // Simplificado - em produção usar peso_teorico_kg_m das bitolas
    const pesoMedioPorMetro = 1.5; // kg/m para bitola média
    let pesoTotal = 0;

    if (peca.tipo_peca === 'coluna' || peca.tipo_peca === 'viga' || peca.tipo_peca === 'estaca') {
      const comprimento = peca.comprimento || 0;
      const qtdePecas = peca.quantidade || 1;
      const qtdeFerros = peca.quantidade_ferros_principais || 4;
      
      // Ferros principais
      pesoTotal += comprimento * qtdeFerros * qtdePecas * pesoMedioPorMetro;
      
      // Reforço (V21.6)
      if (peca.reforco_bitola && peca.reforco_quantidade) {
        pesoTotal += comprimento * peca.reforco_quantidade * qtdePecas * pesoMedioPorMetro;
      }
      
      // Estribos
      const perimetroEstribo = peca.tipo_peca === 'estaca'
        ? Math.PI * (peca.estribo_diametro || 30) / 100
        : 2 * ((peca.estribo_largura || 15) + (peca.estribo_altura || 25)) / 100;
      
      pesoTotal += perimetroEstribo * (peca.quantidade_estribos || 0) * 0.5; // Estribos mais leves
    }

    if (peca.tipo_peca === 'bloco') {
      const comprimentoM = (peca.comprimento || 0) / 100;
      const larguraM = (peca.largura || 0) / 100;
      const ferrosTotal = (peca.ferros_lado1 || 0) + (peca.ferros_lado2 || 0) + (peca.costelas_quantidade || 0);
      
      pesoTotal += (comprimentoM + larguraM) * ferrosTotal * (peca.quantidade || 1) * pesoMedioPorMetro;
    }

    return pesoTotal;
  };

  const adicionarOuEditarPeca = () => {
    if (!tipoPeca) {
      toast.error('Selecione um tipo de peça');
      return;
    }

    const pecaCalculada = calcularPeca();

    setFormData(prev => {
      const novosItens = [...(prev.itens_armado_padrao || [])];
      if (pecaEditandoIndex !== null) {
        novosItens[pecaEditandoIndex] = pecaCalculada;
        toast.success('✅ Peça atualizada');
      } else {
        novosItens.push(pecaCalculada);
        toast.success('✅ Peça adicionada');
      }
      return {
        ...prev,
        itens_armado_padrao: novosItens
      };
    });

    // Reset
    setTipoPeca(null);
    setDadosPeca({});
    setPecaEditandoIndex(null);
  };

  const removerPeca = (index) => {
    setFormData(prev => ({
      ...prev,
      itens_armado_padrao: prev.itens_armado_padrao.filter((_, i) => i !== index)
    }));
    toast.success('✅ Peça removida');
  };

  const editarPeca = (index) => {
    const pecaParaEditar = formData.itens_armado_padrao[index];
    setTipoPeca(pecaParaEditar.tipo_peca);
    setDadosPeca(pecaParaEditar);
    setPecaEditandoIndex(index);
    toast.info('✏️ Editando peça');
  };

  // V21.1: Consolidar por Etapa de Obra
  const consolidarPorEtapa = () => {
    const itensComEtapa = formData.itens_armado_padrao.filter(p => p.etapa_obra_id);
    
    if (itensComEtapa.length === 0) {
      toast.error('Nenhum item possui etapa de obra definida');
      return;
    }

    const etapas = {};
    
    itensComEtapa.forEach(peca => {
      const etapaId = peca.etapa_obra_id;
      if (!etapas[etapaId]) {
        etapas[etapaId] = {
          etapa_obra_id: etapaId,
          etapa_obra_nome: peca.etapa_obra_nome,
          pecas: [],
          peso_total_kg: 0,
          valor_total: 0
        };
      }
      etapas[etapaId].pecas.push(peca);
      etapas[etapaId].peso_total_kg += peca.peso_total_kg || 0;
      etapas[etapaId].valor_total += peca.preco_venda_total || 0;
    });

    const resumo = Object.values(etapas);
    toast.success(`📊 Consolidado em ${resumo.length} etapa(s) de obra`);
    
    // You might want to update formData or display this consolidated view
    // For now, it just toasts and returns the data.
    console.log("Resumo por etapa:", resumo); 
    return resumo;
  };

  const gerarItensComerciais = () => {
    // Injetar itens de armado padrão na aba de revenda (como itens comerciais)
    const itensComerciais = formData.itens_armado_padrao.map(peca => ({
      produto_id: null,
      codigo_sku: peca.identificador,
      descricao: peca.descricao_automatica,
      unidade_medida: 'UN', // V21.1
      quantidade: peca.quantidade,
      quantidade_kg: peca.peso_total_kg, // V21.1
      preco_unitario: peca.preco_venda_total / peca.quantidade,
      valor_item: peca.preco_venda_total,
      peso_unitario: peca.peso_total_kg / peca.quantidade,
      origem_armado: true,
      item_producao_id: peca.id
    }));

    setFormData(prev => ({
      ...prev,
      itens_revenda: [...(prev.itens_revenda || []), ...itensComerciais]
    }));

    toast.success(`✅ ${itensComerciais.length} peça(s) enviada(s) para Aba Revenda`); // V21.1
    onNext();
  };

  // V21.1: Etapas de Obra Disponíveis (simulado - pode vir de formData.obra_destino_id)
  const etapasObra = [
    { id: 'fundacao', nome: 'Fundação' },
    { id: 'estrutura', nome: 'Estrutura' },
    { id: 'cobertura', nome: 'Cobertura' },
    { id: 'acabamento', nome: 'Acabamento' }
  ];

  return (
    <div className="space-y-6">
      {/* Seleção de Tipo */}
      {!tipoPeca && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selecione o Tipo de Peça</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {tiposPeca.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoPeca(tipo.id)}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-5xl mb-3">{tipo.icon}</div>
                  <p className="font-bold text-lg text-slate-900 group-hover:text-blue-600">
                    {tipo.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{tipo.descricao}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário Dinâmico */}
      {tipoPeca && (
        <Card className="border-2 border-blue-600">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Configurar {tiposPeca.find(t => t.id === tipoPeca)?.label}</span>
              <Button
                variant="outline"
                size="sm"
                data-permission="Comercial.ArmadoPadrao.editar"
                onClick={() => {
                  setTipoPeca(null);
                  setDadosPeca({});
                }}
              >
                Trocar Tipo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Campos Comuns */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Identificador</Label>
                <Input
                  placeholder="Ex: V1, C2"
                  value={dadosPeca.identificador || ''}
                  onChange={(e) => setDadosPeca({ ...dadosPeca, identificador: e.target.value })}
                />
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={dadosPeca.quantidade || 1}
                  onChange={(e) => setDadosPeca({ ...dadosPeca, quantidade: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Comprimento (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosPeca.comprimento || ''}
                  onChange={(e) => setDadosPeca({ ...dadosPeca, comprimento: parseFloat(e.target.value) })}
                />
              </div>

              {/* V21.1: Etapa da Obra */}
              <div>
                <Label className="flex items-center gap-1 text-purple-600">
                  <Layers className="w-3 h-3" />
                  Etapa da Obra
                </Label>
                <Select
                  value={dadosPeca.etapa_obra_id}
                  onValueChange={(value) => {
                    const etapa = etapasObra.find(e => e.id === value);
                    setDadosPeca({ 
                      ...dadosPeca, 
                      etapa_obra_id: value,
                      etapa_obra_nome: etapa?.nome 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    {etapasObra.map(etapa => (
                      <SelectItem key={etapa.id} value={etapa.id}>
                        {etapa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campos de BLOCO */}
            {tipoPeca === 'bloco' && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    value={dadosPeca.altura || ''}
                    onChange={(e) => setDadosPeca({ ...dadosPeca, altura: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Largura (cm)</Label>
                  <Input
                    type="number"
                    value={dadosPeca.largura || ''}
                    onChange={(e) => setDadosPeca({ ...dadosPeca, largura: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Espaçamento (cm)</Label>
                  <Input
                    type="number"
                    value={dadosPeca.espacamento || 15}
                    onChange={(e) => setDadosPeca({ ...dadosPeca, espacamento: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Bitola Principal</Label>
                  <Select
                    value={dadosPeca.bitola_principal}
                    onValueChange={(value) => setDadosPeca({ ...dadosPeca, bitola_principal: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="z-[99999]">
                      {bitolas.map((b) => (
                        <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>
                          {b.bitola_diametro_mm}mm ({b.tipo_aco})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Campos de COLUNA/VIGA/ESTACA */}
            {(tipoPeca === 'coluna' || tipoPeca === 'viga' || tipoPeca === 'estaca') && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Bitola Principal (CA-50)</Label>
                    <Select
                      value={dadosPeca.bitola_principal}
                      onValueChange={(value) => setDadosPeca({ ...dadosPeca, bitola_principal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]">
                        {bitolas.filter(b => b.tipo_aco === 'CA-50').map((b) => (
                          <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>
                            {b.bitola_diametro_mm}mm (CA-50)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Qtd Ferros Principais</Label>
                    <Input
                      type="number"
                      min="1"
                      value={dadosPeca.quantidade_ferros_principais || 4}
                      onChange={(e) => setDadosPeca({ ...dadosPeca, quantidade_ferros_principais: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Bitola Reforço (CA-50)</Label>
                    <Select
                      value={dadosPeca.reforco_bitola || ''}
                      onValueChange={(value) => setDadosPeca({ ...dadosPeca, reforco_bitola: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]">
                        <SelectItem value={null}>Nenhum</SelectItem>
                        {bitolas.filter(b => b.tipo_aco === 'CA-50').map((b) => (
                          <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>
                            {b.bitola_diametro_mm}mm
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Qtd Ferros Reforço</Label>
                    <Input
                      type="number"
                      min="0"
                      value={dadosPeca.reforco_quantidade || 0}
                      onChange={(e) => setDadosPeca({ ...dadosPeca, reforco_quantidade: parseInt(e.target.value) })}
                      disabled={!dadosPeca.reforco_bitola}
                      className={!dadosPeca.reforco_bitola ? 'bg-slate-100' : ''}
                    />
                  </div>
                </div>

                {/* Dobras */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={dadosPeca.dobra_l1}
                      onCheckedChange={(checked) => setDadosPeca({ ...dadosPeca, dobra_l1: checked })}
                    />
                    <Label>Dobra L1 (cm)</Label>
                    {dadosPeca.dobra_l1 && (
                      <Input
                        type="number"
                        className="w-24"
                        value={dadosPeca.dobra_lado1 || ''}
                        onChange={(e) => setDadosPeca({ ...dadosPeca, dobra_lado1: parseFloat(e.target.value) })}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={dadosPeca.dobra_l2}
                      onCheckedChange={(checked) => setDadosPeca({ ...dadosPeca, dobra_l2: checked })}
                    />
                    <Label>Dobra L2 (cm)</Label>
                    {dadosPeca.dobra_l2 && (
                      <Input
                        type="number"
                        className="w-24"
                        value={dadosPeca.dobra_lado2 || ''}
                        onChange={(e) => setDadosPeca({ ...dadosPeca, dobra_lado2: parseFloat(e.target.value) })}
                      />
                    )}
                  </div>
                </div>

                {/* Estribos */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Configuração de Estribos</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Bitola Estribo</Label>
                      <Select
                        value={dadosPeca.estribo_bitola}
                        onValueChange={(value) => setDadosPeca({ ...dadosPeca, estribo_bitola: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="z-[99999]">
                          {bitolas.filter(b => b.tipo_aco === 'CA-60' || b.bitola_diametro_mm <= 8).map((b) => (
                            <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>
                              {b.bitola_diametro_mm}mm
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {tipoPeca === 'estaca' ? (
                      <div>
                        <Label>Diâmetro (cm)</Label>
                        <Input
                          type="number"
                          value={dadosPeca.estribo_diametro || ''}
                          onChange={(e) => setDadosPeca({ ...dadosPeca, estribo_diametro: parseFloat(e.target.value) })}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label>Largura (cm)</Label>
                          <Input
                            type="number"
                            value={dadosPeca.estribo_largura || ''}
                            onChange={(e) => setDadosPeca({ ...dadosPeca, estribo_largura: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Altura (cm)</Label>
                          <Input
                            type="number"
                            value={dadosPeca.estribo_altura || ''}
                            onChange={(e) => setDadosPeca({ ...dadosPeca, estribo_altura: parseFloat(e.target.value) })}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label>Distância (cm)</Label>
                      <Input
                        type="number"
                        value={dadosPeca.distancia_estribo || 20}
                        onChange={(e) => setDadosPeca({ ...dadosPeca, distancia_estribo: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  {(tipoPeca === 'coluna' || tipoPeca === 'viga') && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label>Lado Sem Estribo</Label>
                        <Select
                          value={dadosPeca.lado_sem_estribo}
                          onValueChange={(value) => setDadosPeca({ ...dadosPeca, lado_sem_estribo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="z-[99999]">
                            <SelectItem value="nenhum">Nenhum</SelectItem>
                            <SelectItem value="esquerda">Esquerda</SelectItem>
                            <SelectItem value="direita">Direita</SelectItem>
                            <SelectItem value="ambos">Ambos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {dadosPeca.lado_sem_estribo !== 'nenhum' && dadosPeca.lado_sem_estribo && (
                        <div>
                          <Label>Metragem Sem Estribo (cm)</Label>
                          <Input
                            type="number"
                            value={dadosPeca.metragem_sem_estribo || ''}
                            onChange={(e) => setDadosPeca({ ...dadosPeca, metragem_sem_estribo: parseFloat(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <Button
              onClick={adicionarOuEditarPeca}
              data-permission="Comercial.ArmadoPadrao.criar"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {pecaEditandoIndex !== null ? '💾 Salvar Edição' : 'Adicionar Peça ao Pedido'}
            </Button>
            {pecaEditandoIndex !== null && (
              <Button
                onClick={() => {
                  setTipoPeca(null);
                  setDadosPeca({});
                  setPecaEditandoIndex(null);
                  toast.info('❌ Edição cancelada');
                }}
                data-permission="Comercial.ArmadoPadrao.editar"
                variant="outline"
                className="w-full mt-2"
                size="lg"
              >
                Cancelar Edição
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Peças */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Peças Adicionadas ({formData.itens_armado_padrao?.length || 0})</span>
            <div className="flex gap-2">
              {/* V21.1: Botão Consolidar */}
              {formData.itens_armado_padrao && formData.itens_armado_padrao.length > 0 && (
                <Button
                  onClick={consolidarPorEtapa}
                  data-permission="Comercial.ArmadoPadrao.visualizar"
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-600"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Agrupar por Etapa
                </Button>
              )}
              {formData.itens_armado_padrao && formData.itens_armado_padrao.length > 0 && (
                <Button
                  onClick={gerarItensComerciais}
                  data-permission="Comercial.ArmadoPadrao.criar"
                  variant="outline"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Enviar para Aba Revenda
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {formData.itens_armado_padrao && formData.itens_armado_padrao.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Etapa Obra</TableHead>
                  <TableHead>Descrição Técnica</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.itens_armado_padrao.map((peca, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{peca.identificador}</TableCell>
                    <TableCell>
                      {peca.etapa_obra_nome ? (
                        <Badge className="bg-purple-100 text-purple-700">
                          {peca.etapa_obra_nome}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm">{peca.descricao_automatica}</p>
                    </TableCell>
                    <TableCell>{peca.quantidade}</TableCell>
                    <TableCell className="font-semibold">
                      {peca.peso_total_kg?.toFixed(2)} kg
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      R$ {peca.preco_venda_total?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-permission="Comercial.ArmadoPadrao.editar"
                          onClick={() => editarPeca(index)}
                          className="text-blue-600 hover:bg-blue-50"
                          title="Editar Peça"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-permission="Comercial.ArmadoPadrao.excluir"
                          onClick={() => removerPeca(index)}
                          className="text-red-600 hover:bg-red-50"
                          title="Remover Peça"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Box className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma peça adicionada</p>
              <p className="text-sm mt-1">Selecione um tipo de peça acima para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Bitolas */}
      {formData.itens_armado_padrao && formData.itens_armado_padrao.length > 0 && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader className="bg-green-100 border-b">
            <CardTitle className="text-base">📊 Resumo de Matéria-Prima (Armado Padrão)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResumoMateriasPrimas itens={formData.itens_armado_padrao} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Componente de Resumo de Matérias-Primas
 */
function ResumoMateriasPrimas({ itens }) {
  const resumo = {};

  itens.forEach(peca => {
    // Bitola principal
    if (peca.bitola_principal) {
      if (!resumo[peca.bitola_principal]) {
        resumo[peca.bitola_principal] = { peso: 0, tipo: 'CA-50' };
      }
      const pesoFerros = (peca.comprimento || 0) * (peca.quantidade_ferros_principais || 0) * (peca.quantidade || 1) * 1.5;
      resumo[peca.bitola_principal].peso += pesoFerros;
    }

    // Bitola estribo
    if (peca.estribo_bitola) {
      if (!resumo[peca.estribo_bitola]) {
        resumo[peca.estribo_bitola] = { peso: 0, tipo: 'CA-60' };
      }
      const pesoEstribos = (peca.quantidade_estribos || 0) * 0.5; // Peso médio por estribo
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