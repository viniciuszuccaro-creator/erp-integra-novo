import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Sparkles, 
  Smartphone,
  Globe,
  Leaf,
  Box,
  TrendingUp
} from 'lucide-react';

/**
 * Roadmap Futuro do ERP Zuccaro
 * Visão de evolução v4.0 e além
 */
export default function RoadmapFuturo() {
  const roadmap = [
    {
      periodo: 'Curto Prazo (1-2 meses)',
      cor: 'green',
      items: [
        {
          titulo: 'IA Conversacional Interna (ZIA)',
          descricao: 'Comandos diretos no ERP via chat',
          icone: Sparkles,
          status: 'Em Desenvolvimento'
        },
        {
          titulo: 'App Mobile Completo',
          descricao: 'Motoristas, supervisores e vendas',
          icone: Smartphone,
          status: 'Planejado'
        },
        {
          titulo: 'WhatsApp Oficial Meta',
          descricao: 'Integração direta com API oficial',
          icone: Globe,
          status: 'Em Desenvolvimento'
        },
        {
          titulo: 'Roteirizador Offline',
          descricao: 'Zuccaro Maps 100% offline',
          icone: Globe,
          status: 'Planejado'
        }
      ]
    },
    {
      periodo: 'Médio Prazo (3-6 meses)',
      cor: 'blue',
      items: [
        {
          titulo: 'IA Vision Aprimorada',
          descricao: 'Leitura 3D + extração vetorial',
          icone: Sparkles,
          status: 'Pesquisa'
        },
        {
          titulo: 'Previsão de Demanda + Auto Compra',
          descricao: 'Compra automática de insumos por IA',
          icone: TrendingUp,
          status: 'Pesquisa'
        },
        {
          titulo: 'Digital Twin Completo',
          descricao: 'Gêmeo digital de fábrica e obra',
          icone: Box,
          status: 'Planejado'
        },
        {
          titulo: 'Integração Contábil Governamental',
          descricao: 'SPED, ECD, ECF automáticos',
          icone: Globe,
          status: 'Planejado'
        }
      ]
    },
    {
      periodo: 'Longo Prazo (6-12 meses)',
      cor: 'purple',
      items: [
        {
          titulo: 'Realidade Aumentada (AR)',
          descricao: 'Visualização de peças em campo via AR',
          icone: Sparkles,
          status: 'Conceito'
        },
        {
          titulo: 'Módulo de Sustentabilidade',
          descricao: 'Rastreamento de carbono e energia',
          icone: Leaf,
          status: 'Conceito'
        },
        {
          titulo: 'Marketplace de Fornecedores',
          descricao: 'Precificação dinâmica com IA',
          icone: Globe,
          status: 'Conceito'
        },
        {
          titulo: 'Plataforma White Label',
          descricao: 'Licenciamento do ERP Zuccaro',
          icone: Rocket,
          status: 'Conceito'
        }
      ]
    }
  ];

  const statusColors = {
    'Em Desenvolvimento': 'bg-green-600',
    'Planejado': 'bg-blue-600',
    'Pesquisa': 'bg-orange-600',
    'Conceito': 'bg-purple-600'
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-600" />
            Roadmap Zuccaro v4.0 e Além
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Visão de evolução e inovação do ERP Zuccaro
          </p>
        </CardHeader>
      </Card>

      {roadmap.map((fase, idx) => {
        const corClasses = {
          green: 'border-green-200 bg-green-50',
          blue: 'border-blue-200 bg-blue-50',
          purple: 'border-purple-200 bg-purple-50'
        };
        // Classes estáticas por cor (Tailwind purga classes montadas dinamicamente)
        const iconeClasses = {
          green: 'bg-green-100 text-green-600',
          blue: 'bg-blue-100 text-blue-600',
          purple: 'bg-purple-100 text-purple-600'
        };

        return (
          <Card key={idx} className={`border-2 ${corClasses[fase.cor]}`}>
            <CardHeader className="border-b bg-white/80">
              <CardTitle className="text-lg">{fase.periodo}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {fase.items.map((item, i) => {
                  const Icon = item.icone;
                  return (
                    <div key={i} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${iconeClasses[fase.cor] || iconeClasses.blue}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm">{item.titulo}</p>
                            <Badge className={statusColors[item.status]}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">{item.descricao}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Visão Zuccaro 2026 */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-blue-100">
        <CardHeader className="bg-white/80 border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Visão Zuccaro 2026 - "ERP Cognitivo"
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">
                🧠 IA Executiva
              </p>
              <p className="text-sm text-slate-700">
                Gera relatórios e decisões estratégicas automáticas baseadas em dados históricos e tendências de mercado.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">
                ⚙️ IA Operacional
              </p>
              <p className="text-sm text-slate-700">
                Corrige erros e otimiza fluxos em tempo real, reduzindo intervenção humana em tarefas repetitivas.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-green-900 mb-2">
                🌐 IA Relacional
              </p>
              <p className="text-sm text-slate-700">
                Conecta fornecedores, clientes e operadores em um ecossistema colaborativo inteligente.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-600 text-white rounded-lg text-center">
            <p className="font-bold text-lg mb-1">
              "Um ERP que aprende, prevê e decide junto com o gestor"
            </p>
            <p className="text-sm opacity-90">
              Transformando a gestão empresarial através da Inteligência Artificial
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}