import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, Copy, Check, QrCode } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * ETAPA 4 - Gerador de Links de Pagamento
 * Componente para gerar links de pagamento omnichannel
 */
export default function GeradorLinkPagamento({ 
  titulo,
  pedido,
  onClose 
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [config, setConfig] = useState({
    gateway: "asaas", // asaas, mercadopago, pagseguro
    validade_dias: 7,
    permitir_parcelas: false,
    max_parcelas: 1
  });

  const gerarLink = useMutation({
    mutationFn: async () => {
      // Criar registro de pagamento omnichannel
      const pagamento = await base44.entities.PagamentoOmnichannel.create({
        group_id: titulo?.group_id || pedido?.group_id,
        empresa_id: titulo?.empresa_id || pedido?.empresa_id,
        origem_pagamento: "Link Pagamento",
        id_pedido_vinculado: pedido?.id,
        id_cliente: titulo?.cliente_id || pedido?.cliente_id,
        cliente_nome: titulo?.cliente_nome || pedido?.cliente_nome,
        cliente_cpf_cnpj: titulo?.cliente_cpf_cnpj || pedido?.cliente_cpf_cnpj,
        valor_bruto: titulo?.valor_total || pedido?.valor_total || 0,
        valor_liquido: titulo?.valor_total || pedido?.valor_total || 0,
        forma_pagamento: "Link Pagamento",
        gateway_utilizado: config.gateway,
        status_transacao: "Pendente",
        status_conferencia: "Pendente",
        link_expiracao: new Date(Date.now() + config.validade_dias * 24 * 60 * 60 * 1000).toISOString(),
        conta_receber_id: titulo?.id
      });

      // Gerar link fictício (em produção, integraria com gateway real)
      const link = `https://pag.erp-integra.com.br/${config.gateway}/${pagamento.id}`;
      
      await base44.entities.PagamentoOmnichannel.update(pagamento.id, {
        link_pagamento: link
      });

      // Se houver título, vincular
      if (titulo) {
        await base44.entities.ContaReceber.update(titulo.id, {
          link_pagamento_gerado: link,
          data_link_pagamento: new Date().toISOString()
        });
      }

      // Criar ordem de liquidação pendente
      await base44.entities.CaixaOrdemLiquidacao.create({
        group_id: pagamento.group_id,
        empresa_id: pagamento.empresa_id,
        tipo_operacao: "Recebimento",
        origem: "Omnichannel",
        titulos_vinculados: titulo ? [{
          titulo_id: titulo.id,
          tipo_titulo: "ContaReceber",
          numero_titulo: titulo.numero_titulo,
          valor_titulo: titulo.valor_total,
          cliente_fornecedor_id: titulo.cliente_id,
          cliente_fornecedor_nome: titulo.cliente_nome
        }] : [],
        valor_total: pagamento.valor_bruto,
        forma_pagamento_pretendida: "Link Pagamento",
        status: "Pendente",
        data_ordem: new Date().toISOString(),
        usuario_solicitante_id: user.id,
        pagamento_omnichannel_id: pagamento.id,
        pedido_omnichannel_id: pedido?.id
      });

      // Registrar auditoria
      await base44.entities.AuditLog.create({
        group_id: pagamento.group_id,
        empresa_id: pagamento.empresa_id,
        usuario_id: user.id,
        usuario_nome: user.full_name,
        acao: "Geração de Link de Pagamento",
        modulo: "Financeiro",
        entidade: "PagamentoOmnichannel",
        entidade_id: pagamento.id,
        detalhes: {
          valor: pagamento.valor_bruto,
          gateway: config.gateway,
          validade_dias: config.validade_dias,
          titulo_id: titulo?.id,
          pedido_id: pedido?.id
        }
      });

      return { link, pagamento };
    },
    onSuccess: (data) => {
      setLinkGerado(data.link);
      queryClient.invalidateQueries(['contas-receber']);
      queryClient.invalidateQueries(['pagamentos-omnichannel']);
      toast.success("Link de pagamento gerado com sucesso!");
    }
  });

  const copiarLink = () => {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado);
      setCopiado(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const valor = titulo?.valor_total || pedido?.valor_total || 0;

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          Gerar Link de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {!linkGerado ? (
          <>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Cliente:</span>
                <span className="font-medium">
                  {titulo?.cliente_nome || pedido?.cliente_nome}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Valor:</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>

            <div>
              <Label>Gateway de Pagamento</Label>
              <Select 
                value={config.gateway}
                onValueChange={(v) => setConfig({...config, gateway: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asaas">Asaas</SelectItem>
                  <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                  <SelectItem value="pagseguro">PagSeguro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Validade do Link (dias)</Label>
              <Input 
                type="number"
                value={config.validade_dias}
                onChange={(e) => setConfig({...config, validade_dias: parseInt(e.target.value) || 7})}
              />
            </div>

            <Button
                data-permission="Financeiro.LinkPagamento.gerar"
                onClick={() => gerarLink.mutate()}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={gerarLink.isPending}
              >
              <Link2 className="w-4 h-4 mr-2" />
              Gerar Link
            </Button>
          </>
        ) : (
          <>
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Check className="w-5 h-5" />
                Link gerado com sucesso!
              </div>
              
              <div className="p-3 bg-white rounded border break-all text-sm">
                {linkGerado}
              </div>

              <Button data-permission="Financeiro.GeradorLinkPagamento.copiar" 
                onClick={copiarLink}
                variant="outline"
                className="w-full"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded">
              <QrCode className="w-12 h-12 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600">
                QR Code será gerado pelo gateway
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p>✓ Link expira em {config.validade_dias} dias</p>
              <p>✓ Pagamento será registrado automaticamente após confirmação</p>
              <p>✓ Cliente receberá notificação por e-mail/WhatsApp</p>
            </div>

            {onClose && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}