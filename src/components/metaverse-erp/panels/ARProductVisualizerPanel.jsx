import React, { useState } from 'react';
import { Layers, Package, Eye, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ARProductVisualizerPanel() {
  const [produtos] = useState([
    {
      id: 'AR-001',
      nome: 'Bitola CA-50 Ø12.5mm',
      categoria: 'Aço',
      modelo_3d: true,
      ar_disponivel: true,
      visualizacoes_7d: 342,
      taxa_conversao: 28,
      dimensoes: '12.5mm x 12m',
      peso_unitario_kg: 11.24,
      estoque_atual: 45000,
      precisao_modelo: 99.2
    },
    {
      id: 'AR-002',
      nome: 'Perfil I 100x50mm',
      categoria: 'Perfis Metálicos',
      modelo_3d: true,
      ar_disponivel: true,
      visualizacoes_7d: 187,
      taxa_conversao: 34,
      dimensoes: '100x50mm x 6m',
      peso_unitario_kg: 18.5,
      estoque_atual: 12000,
      precisao_modelo: 98.7
    },
    {
      id: 'AR-003',
      nome: 'Parafuso Sextavado M12',
      categoria: 'Fixadores',
      modelo_3d: true,
      ar_disponivel: false,
      visualizacoes_7d: 89,
      taxa_conversao: 18,
      dimensoes: 'M12 x 60mm',
      peso_unitario_kg: 0.085,
      estoque_atual: 8500,
      precisao_modelo: 97.1
    },
    {
      id: 'AR-004',
      nome: 'Chapa Xadrez 4mm',
      categoria: 'Chapas',
      modelo_3d: false,
      ar_disponivel: false,
      visualizacoes_7d: 45,
      taxa_conversao: 12,
      dimensoes: '1200x3000x4mm',
      peso_unitario_kg: 113.4,
      estoque_atual: 2800,
      precisao_modelo: 0
    },
  ]);

  return (
    <div className="w-full h-full space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Visualizador AR de Produtos</h3>
            <p className="text-sm text-slate-600">Modelos 3D precisos para visualização em realidade aumentada</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge className="bg-emerald-600">3 com AR</Badge>
            <Badge className="bg-blue-600">663 views/7d</Badge>
          </div>
        </div>
      </div>

      {produtos.map((produto) => (
        <Card key={produto.id} className="border-slate-200 hover:border-emerald-400 transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-500" />
                  {produto.nome}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">{produto.categoria} • {produto.dimensoes}</p>
              </div>
              <div className="flex gap-1">
                {produto.modelo_3d && <Badge className="bg-blue-600 text-xs">3D</Badge>}
                {produto.ar_disponivel && <Badge className="bg-emerald-600 text-xs">AR</Badge>}
                {!produto.modelo_3d && <Badge variant="outline" className="text-xs">Sem Modelo</Badge>}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Métricas */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Views (7d)</p>
                <p className="text-lg font-bold text-blue-700">{produto.visualizacoes_7d}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Tx Conversão</p>
                <p className="text-lg font-bold text-emerald-700">{produto.taxa_conversao}%</p>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Estoque</p>
                <p className="text-lg font-bold text-slate-700">{produto.estoque_atual >= 1000 ? `${(produto.estoque_atual/1000).toFixed(0)}k` : produto.estoque_atual}</p>
              </div>
            </div>

            {/* Precisão do modelo */}
            {produto.modelo_3d && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">Precisão do Modelo 3D</span>
                  <span className="text-xs font-semibold">{produto.precisao_modelo}%</span>
                </div>
                <Progress value={produto.precisao_modelo} className="h-2" />
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              {produto.ar_disponivel ? (
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Eye className="w-3 h-3 mr-1" />
                  Visualizar em AR
                </Button>
              ) : produto.modelo_3d ? (
                <Button data-permission="Sistema.ARProductVisualizer.gerar" size="sm" variant="outline" className="flex-1">
                  <Layers className="w-3 h-3 mr-1" />
                  Ver 3D
                </Button>
              ) : (
                <Button data-permission="Sistema.ARProductVisualizer.gerar" size="sm" variant="outline" className="flex-1 text-slate-400">
                  <Zap className="w-3 h-3 mr-1" />
                  Gerar Modelo IA
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}