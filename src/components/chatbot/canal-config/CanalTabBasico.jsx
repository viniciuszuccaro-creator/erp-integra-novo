import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, RefreshCw, Settings } from "lucide-react";

/** Sub-componente extraído: Formulário básico de configuração do canal */
export default function CanalTabBasico({ canalSelecionado, configAtual, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    ativo: false, modo_atendimento: 'Bot com Transbordo', mensagem_boas_vindas: '', mensagem_ausencia: '',
    mensagem_fila_espera: '', mensagem_transferencia: '', mensagem_encerramento: '', tempo_timeout_minutos: 30
  });

  useEffect(() => {
    if (configAtual) {
      setFormData({
        ativo: configAtual.ativo || false, modo_atendimento: configAtual.modo_atendimento || 'Bot com Transbordo',
        mensagem_boas_vindas: configAtual.mensagem_boas_vindas || '', mensagem_ausencia: configAtual.mensagem_ausencia || '',
        mensagem_fila_espera: configAtual.mensagem_fila_espera || '', mensagem_transferencia: configAtual.mensagem_transferencia || '',
        mensagem_encerramento: configAtual.mensagem_encerramento || '', tempo_timeout_minutos: configAtual.tempo_timeout_minutos || 30
      });
    }
  }, [configAtual]);

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-lg"><Settings className="w-5 h-5" />Configurar {canalSelecionado}</CardTitle></CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div><Label className="text-base font-semibold">Canal Ativo</Label><p className="text-sm text-slate-600">Habilitar atendimento neste canal</p></div>
              <Switch checked={formData.ativo} onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })} />
            </div>
            <div><Label>Modo de Atendimento</Label>
              <select value={formData.modo_atendimento} onChange={(e) => setFormData({ ...formData, modo_atendimento: e.target.value })} className="w-full px-3 py-2 border rounded-md mt-1">
                <option value="Apenas Bot">Apenas Bot</option><option value="Bot com Transbordo">Bot com Transbordo (Recomendado)</option>
                <option value="Apenas Humano">Apenas Humano</option><option value="Híbrido">Híbrido</option><option value="IA Avançada">IA Avançada</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Mensagem de Boas-Vindas</Label><Textarea value={formData.mensagem_boas_vindas} onChange={(e) => setFormData({ ...formData, mensagem_boas_vindas: e.target.value })} placeholder="Olá! 👋 Como posso ajudar?" className="mt-1 h-20" /></div>
              <div><Label>Mensagem Fora de Horário</Label><Textarea value={formData.mensagem_ausencia} onChange={(e) => setFormData({ ...formData, mensagem_ausencia: e.target.value })} placeholder="Estamos fora do horário..." className="mt-1 h-20" /></div>
              <div><Label>Mensagem Fila de Espera</Label><Textarea value={formData.mensagem_fila_espera} onChange={(e) => setFormData({ ...formData, mensagem_fila_espera: e.target.value })} placeholder="Aguarde um momento..." className="mt-1 h-20" /></div>
              <div><Label>Mensagem de Transferência</Label><Textarea value={formData.mensagem_transferencia} onChange={(e) => setFormData({ ...formData, mensagem_transferencia: e.target.value })} placeholder="Transferindo para um atendente..." className="mt-1 h-20" /></div>
            </div>
            <div><Label>Mensagem de Encerramento</Label><Textarea value={formData.mensagem_encerramento} onChange={(e) => setFormData({ ...formData, mensagem_encerramento: e.target.value })} placeholder="Obrigado pelo contato! 😊" className="mt-1 h-16" /></div>
            <div><Label>Tempo de Timeout (minutos)</Label><Input type="number" value={formData.tempo_timeout_minutos} onChange={(e) => setFormData({ ...formData, tempo_timeout_minutos: parseInt(e.target.value) || 30 })} className="mt-1 w-32" /></div>
            {canalSelecionado === 'WhatsApp' && <Alert className="bg-green-50 border-green-200"><AlertDescription className="text-sm text-green-800">⚠️ Integração WhatsApp Business API requer <strong>Backend Functions</strong></AlertDescription></Alert>}
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSaving} data-permission="Chatbot.ConfiguracaoCanal.salvar" className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar Configuração
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}