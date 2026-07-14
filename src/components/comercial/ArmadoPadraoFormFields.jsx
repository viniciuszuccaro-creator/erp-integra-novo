import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Layers } from 'lucide-react';

/**
 * V21.1 - Formulário dinâmico do Armado Padrão
 * Extraído de ArmadoPadraoTab.jsx.
 * Renderiza campos comuns + específicos por tipo de peça.
 */
export default function ArmadoPadraoFormFields({
  tipoPeca, setTipoPeca,
  dadosPeca, setDadosPeca,
  bitolas, tiposPeca, etapasObra,
  pecaEditandoIndex,
  onAdicionar, onTrocarTipo, onCancelarEdicao
}) {
  const tipoLabel = tiposPeca.find(t => t.id === tipoPeca)?.label;

  return (
    <Card className="border-2 border-blue-600">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Configurar {tipoLabel}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onTrocarTipo}
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
          <div>
            <Label className="flex items-center gap-1 text-purple-600">
              <Layers className="w-3 h-3" />
              Etapa da Obra
            </Label>
            <Select
              value={dadosPeca.etapa_obra_id}
              onValueChange={(value) => {
                const etapa = etapasObra.find(e => e.id === value);
                setDadosPeca({ ...dadosPeca, etapa_obra_id: value, etapa_obra_nome: etapa?.nome });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="z-[99999]">
                {etapasObra.map(etapa => (
                  <SelectItem key={etapa.id} value={etapa.id}>{etapa.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vol 5.3: Vínculo a obra — ponto, pavimento, posição, revisão, data prevista */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg">
          <div>
            <Label>Ponto</Label>
            <Input placeholder="Ex: P1, P2" value={dadosPeca.ponto || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, ponto: e.target.value })} />
          </div>
          <div>
            <Label>Pavimento</Label>
            <Input placeholder="Ex: Térreo, 1º" value={dadosPeca.pavimento || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, pavimento: e.target.value })} />
          </div>
          <div>
            <Label>Posição</Label>
            <Input placeholder="Ex: A1, B2" value={dadosPeca.posicao || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, posicao: e.target.value })} />
          </div>
          <div>
            <Label>Revisão</Label>
            <Input type="number" min="1" value={dadosPeca.revisao || 1} onChange={(e) => setDadosPeca({ ...dadosPeca, revisao: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <Label>Data Prevista</Label>
            <Input type="date" value={dadosPeca.data_prevista || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, data_prevista: e.target.value })} />
          </div>
        </div>

        {/* Campos de BLOCO */}
        {tipoPeca === 'bloco' && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <Label>Altura (cm)</Label>
              <Input type="number" value={dadosPeca.altura || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, altura: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Largura (cm)</Label>
              <Input type="number" value={dadosPeca.largura || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, largura: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Espaçamento (cm)</Label>
              <Input type="number" value={dadosPeca.espacamento || 15} onChange={(e) => setDadosPeca({ ...dadosPeca, espacamento: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Bitola Principal</Label>
              <Select value={dadosPeca.bitola_principal} onValueChange={(value) => setDadosPeca({ ...dadosPeca, bitola_principal: value })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="z-[99999]">
                  {bitolas.map((b) => (
                    <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>{b.bitola_diametro_mm}mm ({b.tipo_aco})</SelectItem>
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
                <Select value={dadosPeca.bitola_principal} onValueChange={(value) => setDadosPeca({ ...dadosPeca, bitola_principal: value })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="z-[99999]">
                    {bitolas.filter(b => b.tipo_aco === 'CA-50').map((b) => (
                      <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>{b.bitola_diametro_mm}mm (CA-50)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Qtd Ferros Principais</Label>
                <Input type="number" min="1" value={dadosPeca.quantidade_ferros_principais || 4} onChange={(e) => setDadosPeca({ ...dadosPeca, quantidade_ferros_principais: parseInt(e.target.value) })} />
              </div>
              <div>
                <Label>Bitola Reforço (CA-50)</Label>
                <Select value={dadosPeca.reforco_bitola || ''} onValueChange={(value) => setDadosPeca({ ...dadosPeca, reforco_bitola: value })}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {bitolas.filter(b => b.tipo_aco === 'CA-50').map((b) => (
                      <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>{b.bitola_diametro_mm}mm</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Qtd Ferros Reforço</Label>
                <Input type="number" min="0" value={dadosPeca.reforco_quantidade || 0} onChange={(e) => setDadosPeca({ ...dadosPeca, reforco_quantidade: parseInt(e.target.value) })} disabled={!dadosPeca.reforco_bitola} className={!dadosPeca.reforco_bitola ? 'bg-slate-100' : ''} />
              </div>
            </div>

            {/* Dobras */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox checked={dadosPeca.dobra_l1} onCheckedChange={(checked) => setDadosPeca({ ...dadosPeca, dobra_l1: checked })} />
                <Label>Dobra L1 (cm)</Label>
                {dadosPeca.dobra_l1 && (
                  <Input type="number" className="w-24" value={dadosPeca.dobra_lado1 || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, dobra_lado1: parseFloat(e.target.value) })} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={dadosPeca.dobra_l2} onCheckedChange={(checked) => setDadosPeca({ ...dadosPeca, dobra_l2: checked })} />
                <Label>Dobra L2 (cm)</Label>
                {dadosPeca.dobra_l2 && (
                  <Input type="number" className="w-24" value={dadosPeca.dobra_lado2 || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, dobra_lado2: parseFloat(e.target.value) })} />
                )}
              </div>
            </div>

            {/* Estribos */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Configuração de Estribos</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Bitola Estribo</Label>
                  <Select value={dadosPeca.estribo_bitola} onValueChange={(value) => setDadosPeca({ ...dadosPeca, estribo_bitola: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="z-[99999]">
                      {bitolas.filter(b => b.tipo_aco === 'CA-60' || b.bitola_diametro_mm <= 8).map((b) => (
                        <SelectItem key={b.id} value={b.bitola_diametro_mm + 'mm'}>{b.bitola_diametro_mm}mm</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {tipoPeca === 'estaca' ? (
                  <div>
                    <Label>Diâmetro (cm)</Label>
                    <Input type="number" value={dadosPeca.estribo_diametro || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, estribo_diametro: parseFloat(e.target.value) })} />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Largura (cm)</Label>
                      <Input type="number" value={dadosPeca.estribo_largura || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, estribo_largura: parseFloat(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Altura (cm)</Label>
                      <Input type="number" value={dadosPeca.estribo_altura || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, estribo_altura: parseFloat(e.target.value) })} />
                    </div>
                  </>
                )}
                <div>
                  <Label>Distância (cm)</Label>
                  <Input type="number" value={dadosPeca.distancia_estribo || 20} onChange={(e) => setDadosPeca({ ...dadosPeca, distancia_estribo: parseFloat(e.target.value) })} />
                </div>
              </div>

              {(tipoPeca === 'coluna' || tipoPeca === 'viga') && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label>Lado Sem Estribo</Label>
                    <Select value={dadosPeca.lado_sem_estribo} onValueChange={(value) => setDadosPeca({ ...dadosPeca, lado_sem_estribo: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                      <Input type="number" value={dadosPeca.metragem_sem_estribo || ''} onChange={(e) => setDadosPeca({ ...dadosPeca, metragem_sem_estribo: parseFloat(e.target.value) })} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <Button onClick={onAdicionar} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          {pecaEditandoIndex !== null ? '💾 Salvar Edição' : 'Adicionar Peça ao Pedido'}
        </Button>
        {pecaEditandoIndex !== null && (
          <Button onClick={onCancelarEdicao} variant="outline" className="w-full mt-2" size="lg">
            Cancelar Edição
          </Button>
        )}
      </CardContent>
    </Card>
  );
}