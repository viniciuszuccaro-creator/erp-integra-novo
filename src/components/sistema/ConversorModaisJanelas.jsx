import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Layout, 
  Maximize2, 
  Info,
  Sparkles,
  Layers
} from 'lucide-react';
import { useModalAsWindow } from '@/components/lib/useModalAsWindow';

/**
 * V22.0 ETAPA 3 - Conversor de Modais em Janelas
 * 
 * Demonstra como converter modais existentes em janelas não-bloqueantes
 * Fornece exemplo prático e orientação
 */
export default function ConversorModaisJanelas() {
  const { openAsWindow, openFormAsWindow } = useModalAsWindow();
  const [exemplo, setExemplo] = useState(null);

  const abrirExemploModal = () => {
    openAsWindow({
      title: '📝 Exemplo de Modal como Janela',
      component: ExemploConteudo,
      props: { onFechar: () => {} },
      width: '600px',
      height: '400px'
    });
  };

  const abrirExemploForm = () => {
    openFormAsWindow({
      title: '📋 Exemplo de Formulário',
      formComponent: ExemploFormulario,
      data: { nome: '', email: '' },
      onSave: async (dados) => {
        console.log('Salvo:', dados);
        setExemplo(dados);
      },
      width: '500px',
      height: '350px'
    });
  };

  return (
    <div className="w-full h-full space-y-6">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            Conversor de Modais em Janelas
            <Badge className="bg-blue-600 text-white ml-auto">
              V22.0 ETAPA 3
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Info */}
          <Alert className="border-blue-300 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription>
              <strong>Nova Arquitetura:</strong> Modais agora podem ser abertos como janelas não-bloqueantes,
              permitindo multitarefa real sem bloquear a interação com outras telas.
            </AlertDescription>
          </Alert>

          {/* Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 border-green-300">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Não-Bloqueante</h3>
              <p className="text-xs text-green-700">
                Múltiplas janelas abertas simultaneamente
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 border-blue-300">
              <Maximize2 className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Redimensionável</h3>
              <p className="text-xs text-blue-700">
                Controles de minimizar, maximizar e fechar
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50 border-purple-300">
              <Layers className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">Empilhável</h3>
              <p className="text-xs text-purple-700">
                Gerenciamento de z-index automático
              </p>
            </div>
          </div>

          {/* Exemplos Práticos */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Exemplos Práticos
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={abrirExemploModal}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Layout className="w-4 h-4 mr-2" />
                Abrir Modal Simples
              </Button>

              <Button
                onClick={abrirExemploForm}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Abrir Formulário
              </Button>
            </div>
          </div>

          {/* Código Exemplo */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">💻 Como Usar</h3>
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
              <pre>{`import { useModalAsWindow } from '@/components/lib/useModalAsWindow';

function MeuComponente() {
  const { openAsWindow } = useModalAsWindow();

  const abrirJanela = () => {
    openAsWindow({
      title: 'Minha Janela',
      component: MeuConteudo,
      props: { data: {...} },
      width: '800px',
      height: '600px'
    });
  };

  return <Button onClick={abrirJanela}>Abrir</Button>;
}`}</pre>
            </div>
          </div>

          {/* Status */}
          {exemplo && (
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription>
                ✅ Formulário salvo: {JSON.stringify(exemplo)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de exemplo
function ExemploConteudo({ onFechar }) {
  return (
    <div className="p-6 space-y-4">
      <p className="text-slate-700">
        Este é um exemplo de modal convertido em janela não-bloqueante.
      </p>
      <p className="text-slate-600 text-sm">
        Você pode abrir múltiplas janelas, minimizá-las, maximizá-las e trabalhar em paralelo!
      </p>
      <div className="flex gap-2">
        <Badge className="bg-blue-600">Não-Bloqueante</Badge>
        <Badge className="bg-green-600">Redimensionável</Badge>
        <Badge className="bg-purple-600">Multitarefa</Badge>
      </div>
    </div>
  );
}

// Formulário de exemplo
function ExemploFormulario({ data, onSave, onCancel }) {
  const [form, setForm] = React.useState(data || { nome: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="text-sm font-medium">Nome</label>
        <input
          type="text"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Salvar
        </Button>
      </div>
    </form>
  );
}