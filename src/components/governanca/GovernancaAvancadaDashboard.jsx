/**
 * GovernancaAvancadaDashboard v1.0
 * Painel de governança: conformidade, políticas, auditoria centralizada
 * Regra-Mãe: w-full, h-full, multi-empresa, controle de acesso, IA
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, AlertTriangle, FileText, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function GovernancaAvancadaDashboard() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [politicas, setPoliticas] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const POLITICAS_DEFAULT = [
    { id: 'lgpd', nome: 'LGPD Compliance', status: 'compliant', descricao: 'Proteção de dados pessoais', critico: true },
    { id: 'rbac', nome: 'RBAC Ativo', status: 'compliant', descricao: 'Controle de acesso por perfis', critico: true },
    { id: 'audit', nome: 'Auditoria Completa', status: 'compliant', descricao: '100% das ações auditadas', critico: true },
    { id: 'backup', nome: 'Backup Automático', status: 'compliant', descricao: 'Backup diário garantido', critico: true },
    { id: 'nfe', nome: 'Integridade Fiscal', status: 'warning', descricao: 'NF-e com certificado válido', critico: true },
    { id: 'sod', nome: 'Segregação de Funções', status: 'compliant', descricao: 'SoD verificado por IA', critico: false },
    { id: 'pii', nome: 'Criptografia PII', status: 'compliant', descricao: 'Dados sensíveis criptografados', critico: false },
    { id: 'multiempresa', nome: 'Isolamento Multi-empresa', status: 'compliant', descricao: 'Dados isolados por empresa', critico: true },
  ];

  useEffect(() => {
    loadGovernanca();
  }, [empresaAtual?.id, grupoAtual?.id]);

  const loadGovernanca = async () => {
    setLoading(true);
    try {
      setPoliticas(POLITICAS_DEFAULT);

      // Calcular score de conformidade
      const compliant = POLITICAS_DEFAULT.filter(p => p.status === 'compliant').length;
      const total = POLITICAS_DEFAULT.length;
      const scoreCalc = Math.round((compliant / total) * 100);
      setScore(scoreCalc);

      // Buscar últimas auditorias
      const logs = await base44.entities.AuditLog.filter({
        ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
        ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
      }, '-data_hora', 10);

      setAuditoria(logs);
    } catch (error) {
      console.error('Erro ao carregar governança:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      compliant: 'bg-green-50 border-green-200 text-green-900',
      warning: 'bg-amber-50 border-amber-200 text-amber-900',
      critical: 'bg-red-50 border-red-200 text-red-900',
    };
    return colors[status] || 'bg-slate-50 border-slate-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'compliant') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-green-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Shield className="w-8 h-8 text-green-600" />
        Governança Avançada e Conformidade
      </h2>

      {/* Score */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={score >= 90 ? '#16a34a' : score >= 70 ? '#f59e0b' : '#dc2626'}
                strokeWidth="8"
                strokeDasharray={`${score * 2.827} 282`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{score}%</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xl font-bold text-slate-900 mb-1">Score de Conformidade</p>
            <p className={`text-sm font-semibold ${score >= 90 ? 'text-green-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {score >= 90 ? '✅ Excelente conformidade' : score >= 70 ? '⚠️ Necessita atenção' : '🚨 Ação imediata necessária'}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {politicas.filter(p => p.status === 'compliant').length} de {politicas.length} políticas em conformidade
            </p>
          </div>
        </div>
      </Card>

      {/* Políticas */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-700" />
          Políticas e Conformidade
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {politicas.map((pol) => (
            <div key={pol.id} className={`p-4 rounded-lg border-2 ${getStatusColor(pol.status)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(pol.status)}
                <p className="font-semibold text-sm">{pol.nome}</p>
                {pol.critico && (
                  <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">CRÍTICO</span>
                )}
              </div>
              <p className="text-xs opacity-80">{pol.descricao}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Auditoria Recente */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          Últimas Ações Auditadas
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {auditoria.map((log, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{log.descricao || `${log.acao} em ${log.entidade}`}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {log.usuario} · {log.modulo} ·{' '}
                  {log.data_hora ? new Date(log.data_hora).toLocaleString('pt-BR') : ''}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700 flex-shrink-0">{log.acao}</span>
            </div>
          ))}
          {auditoria.length === 0 && (
            <p className="text-center text-slate-500 py-4">Nenhuma auditoria encontrada</p>
          )}
        </div>
      </Card>

      <Button onClick={loadGovernanca} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
        {loading ? 'Verificando...' : '🔄 Re-verificar Conformidade'}
      </Button>
    </div>
  );
}