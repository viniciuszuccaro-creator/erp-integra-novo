/**
 * GamificacaoInteligente v1.0
 * Sistema de gamificação com badges, leaderboards, conquistas
 * Regra-Mãe: w-full, h-full, multi-empresa, IA
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Star, Zap, TrendingUp, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const BADGES = {
  uptime_champion: { nome: '🏆 Campeão de Uptime', descricao: '99.9%+ uptime por 30 dias', icon: Trophy },
  optimization_master: { nome: '⚡ Mestre em Otimização', descricao: '10 otimizações executadas', icon: Zap },
  problem_solver: { nome: '🔧 Solucionador', descricao: 'Resolveu 50 problemas previstos', icon: Award },
  recovery_hero: { nome: '🚀 Herói de Recuperação', descricao: '100 auto-recoveries bem-sucedidas', icon: TrendingUp },
};

export default function GamificacaoInteligente() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [conquistas, setConquistas] = useState([]);
  const [pontos, setPontos] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!empresaAtual?.id && contexto !== 'grupo') return;
    loadConquistas();
  }, [empresaAtual?.id, grupoAtual?.id]);

  const loadConquistas = async () => {
    setLoading(true);
    try {
      // Buscar conquistas do usuário
      const userConquistas = await base44.entities.AuditLog.filter({
        ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
        ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
        tipo_auditoria: 'gamificacao',
      });

      // Calcular pontos
      const totalPontos = userConquistas.reduce((sum, log) => {
        const pontos = {
          uptime: 10,
          optimization: 25,
          problem_solved: 15,
          recovery: 20,
        };
        return sum + (pontos[log.dados_novos?.tipo] || 0);
      }, 0);

      setPontos(totalPontos);
      setConquistas(userConquistas.slice(0, 10));

      // Carregar ranking
      const allUsers = await base44.entities.AuditLog.filter({
        tipo_auditoria: 'gamificacao',
      });

      const rankingData = {};
      allUsers.forEach((log) => {
        const usuario = log.usuario;
        if (!rankingData[usuario]) rankingData[usuario] = 0;
        rankingData[usuario] += log.dados_novos?.pontos || 0;
      });

      const sortedRanking = Object.entries(rankingData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([user, points], idx) => ({
          posicao: idx + 1,
          usuario: user,
          pontos: points,
        }));

      setRanking(sortedRanking);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardBadge = async (badgeId) => {
    try {
      const badge = BADGES[badgeId];
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me())?.full_name || 'Usuário',
        acao: 'Conquista',
        modulo: 'Gamificação',
        tipo_auditoria: 'gamificacao',
        entidade: 'Badge',
        descricao: `Conquistou badge: ${badge.nome}`,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
        dados_novos: { badge_id: badgeId, pontos: 100 },
        data_hora: new Date().toISOString(),
      });

      setPontos((prev) => prev + 100);
      loadConquistas();
    } catch (error) {
      console.error('Erro ao conceder badge:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Star className="w-8 h-8 text-yellow-500" />
        Gamificação Inteligente
      </h2>

      {/* Pontos Totais */}
      <Card className="w-full p-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg">
        <p className="text-sm opacity-90">Seus Pontos Totais</p>
        <p className="text-5xl font-bold mt-2">{pontos}</p>
        <p className="text-sm mt-2 opacity-90">
          Próximo nível em {Math.max(0, 500 - pontos)} pontos
        </p>
      </Card>

      {/* Badges Disponíveis */}
      <Card className="w-full p-6 bg-white rounded-lg">
        <h3 className="font-bold text-lg mb-4">🏅 Badges Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(BADGES).map(([id, badge]) => {
            const Icon = badge.icon;
            return (
              <div
                key={id}
                className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:border-purple-400 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-6 h-6 text-purple-600" />
                  <button
                    onClick={() => awardBadge(id)}
                    className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Conquistar
                  </button>
                </div>
                <p className="font-semibold text-sm text-slate-900">{badge.nome}</p>
                <p className="text-xs text-slate-600 mt-1">{badge.descricao}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="w-full p-6 bg-white rounded-lg">
        <h3 className="font-bold text-lg mb-4">🏆 Leaderboard Global</h3>
        <div className="space-y-2">
          {ranking.map((entry) => (
            <div
              key={entry.posicao}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  {entry.posicao}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{entry.usuario}</p>
                  <p className="text-xs text-slate-600">{entry.pontos} pontos</p>
                </div>
              </div>
              <div className="text-right">
                {entry.posicao === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                {entry.posicao === 2 && <Trophy className="w-5 h-5 text-slate-400" />}
                {entry.posicao === 3 && <Trophy className="w-5 h-5 text-orange-400" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Histórico de Conquistas */}
      <Card className="w-full p-6 bg-white rounded-lg">
        <h3 className="font-bold text-lg mb-4">📜 Histórico de Conquistas</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {conquistas.map((log, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
              <p className="font-semibold text-slate-900">{log.descricao}</p>
              <p className="text-xs text-slate-600 mt-1">
                {new Date(log.data_hora).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
          {conquistas.length === 0 && (
            <p className="text-center text-slate-500 py-4">Nenhuma conquista ainda...</p>
          )}
        </div>
      </Card>
    </div>
  );
}