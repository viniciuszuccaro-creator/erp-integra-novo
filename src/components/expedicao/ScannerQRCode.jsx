import React, { useState } from 'react';
import RBACButton from "@/components/lib/RBACButton";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Scan,
  Package
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Scanner de QR Code para Separação/Conferência
 * Permite leitura manual ou por câmera (preparado)
 */
export default function ScannerQRCode({ 
  entregaId,
  itensEsperados = [],
  onItemEscaneado,
  modo = 'separacao' // 'separacao' ou 'conferencia'
}) {
  const [codigoManual, setCodigoManual] = useState('');
  const [escaneando, setEscaneando] = useState(false);
  const [itensLidos, setItensLidos] = useState([]);
  const { toast } = useToast();

  const processarCodigo = (codigo) => {
    // Verifica se o código existe nos itens esperados
    const itemEncontrado = itensEsperados.find(item => 
      item.qr_code === codigo || 
      item.identificador === codigo ||
      item.codigo_sku === codigo
    );

    if (itemEncontrado) {
      // Verifica se já foi lido
      const jaLido = itensLidos.find(i => i.id === itemEncontrado.id);
      
      if (jaLido) {
        toast({
          title: '⚠️ Item já escaneado',
          description: `${itemEncontrado.descricao} - Qtd: ${itemEncontrado.quantidade}`,
          variant: 'warning'
        });
        return;
      }

      // Adiciona aos itens lidos
      const novoItem = {
        ...itemEncontrado,
        data_scan: new Date().toISOString(),
        modo_scan: 'manual'
      };
      
      setItensLidos(prev => [...prev, novoItem]);
      
      toast({
        title: '✅ Item confirmado!',
        description: `${itemEncontrado.descricao} - Qtd: ${itemEncontrado.quantidade}`,
        variant: 'success'
      });

      // Callback para componente pai
      if (onItemEscaneado) {
        onItemEscaneado(novoItem);
      }

      setCodigoManual('');
    } else {
      toast({
        title: '❌ Código não encontrado',
        description: 'Este item não pertence a esta entrega',
        variant: 'destructive'
      });
    }
  };

  const handleScanManual = () => {
    if (!codigoManual.trim()) return;
    processarCodigo(codigoManual.trim());
  };

  const progresso = itensEsperados.length > 0
    ? ((itensLidos.length / itensEsperados.length) * 100).toFixed(0)
    : 0;

  const todosLidos = itensLidos.length === itensEsperados.length;

  return (
    <div className="space-y-4">
      {/* Header com Progresso */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            Scanner QR Code - {modo === 'separacao' ? 'Separação' : 'Conferência'}
          </CardTitle>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Progresso</span>
              <span className="font-semibold">{itensLidos.length}/{itensEsperados.length} itens</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${todosLidos ? 'bg-green-600' : 'bg-blue-600'}`}
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scanner Manual */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Leitura Manual</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScanManual()}
              placeholder="Digite ou escaneie o código..."
              className="text-lg font-mono"
              autoFocus
            />
            <RBACButton module="Expedicao" action="confirmar" 
              onClick={handleScanManual}
              disabled={!codigoManual.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Scan className="w-5 h-5 mr-2" />
              Confirmar
            </RBACButton>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            💡 Use um leitor de código de barras ou digite manualmente
          </p>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Itens Lidos */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="bg-white/80 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Itens Confirmados ({itensLidos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {itensLidos.map((item, idx) => (
              <div key={idx} className="p-3 bg-white border border-green-300 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.descricao}</p>
                    <p className="text-xs text-slate-600">
                      Qtd: {item.quantidade} {item.unidade || 'UN'}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            ))}
            
            {itensLidos.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum item confirmado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itens Pendentes */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="bg-white/80 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Itens Pendentes ({itensEsperados.length - itensLidos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {itensEsperados
              .filter(item => !itensLidos.find(lido => lido.id === item.id))
              .map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-orange-300 rounded-lg">
                  <p className="font-semibold text-sm">{item.descricao}</p>
                  <p className="text-xs text-slate-600">
                    Qtd: {item.quantidade} {item.unidade || 'UN'}
                  </p>
                  {item.qr_code && (
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      QR: {item.qr_code}
                    </p>
                  )}
                </div>
              ))}

            {(itensEsperados.length - itensLidos.length) === 0 && (
              <div className="text-center py-8 text-green-600">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-semibold">Todos os itens confirmados!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Finais */}
      {todosLidos && (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900 mb-2">
              ✅ {modo === 'separacao' ? 'Separação' : 'Conferência'} Completa!
            </p>
            <p className="text-sm text-green-700">
              Todos os {itensEsperados.length} itens foram confirmados.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}