import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function EmpresaOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [empresa, setEmpresa] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
  });
  const navigate = useNavigate();

  const handleCreateEmpresa = async () => {
    if (!empresa.razao_social || !empresa.cnpj) {
      toast.error('Razão social e CNPJ são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.entities.Empresa.create({
        ...empresa,
        status: 'Ativa',
      });

      if (res?.id) {
        // Atualizar contexto do usuário para a empresa criada
        await base44.auth.updateMe({
          ultima_empresa_id: res.id,
        });

        toast.success('Empresa criada com sucesso!');
        setTimeout(() => navigate('/'), 500);
      }
    } catch (err) {
      toast.error(`Erro ao criar empresa: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo ao ERP Zuccaro</h1>
          <p className="text-slate-600">Vamos configurar sua primeira empresa para começar</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {step === 1 ? 'Cadastro da Empresa' : 'Confirmação'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social *</label>
                  <Input
                    placeholder="Ex: Zuccaro Distribuidora Ltda"
                    value={empresa.razao_social}
                    onChange={(e) => setEmpresa(p => ({ ...p, razao_social: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia (Opcional)</label>
                  <Input
                    placeholder="Ex: Zuccaro"
                    value={empresa.nome_fantasia}
                    onChange={(e) => setEmpresa(p => ({ ...p, nome_fantasia: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ *</label>
                  <Input
                    placeholder="Ex: 12.345.678/0001-00"
                    value={empresa.cnpj}
                    onChange={(e) => setEmpresa(p => ({ ...p, cnpj: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Você pode cadastrar mais empresas depois em Administração → Empresas & Grupos.
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Próximo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-slate-600">
                    <strong>Razão Social:</strong> {empresa.razao_social}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Nome Fantasia:</strong> {empresa.nome_fantasia || '(não informado)'}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>CNPJ:</strong> {empresa.cnpj}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <strong>✅ Confirmar criação?</strong> Após isso, você terá acesso completo ao sistema.
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleCreateEmpresa}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {loading ? 'Criando...' : 'Criar Empresa'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Precisa de ajuda? Consulte a <a href="#" className="text-blue-600 hover:underline">documentação</a>
        </p>
      </div>
    </div>
  );
}