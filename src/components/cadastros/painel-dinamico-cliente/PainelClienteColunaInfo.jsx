import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

/**
 * Coluna 1 do PainelDinamicoCliente (Regra-Mãe P1).
 * Cards de Informações Gerais, Financeiro e Performance.
 */
export default function PainelClienteColunaInfo({ cliente, totalEmAberto }) {
  return (
    <div className="space-y-4">
      {/* Informações Gerais */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cliente.vendedor_responsavel && (
            <div>
              <p className="text-xs text-slate-500">Vendedor Responsável</p>
              <p className="font-medium text-sm">{cliente.vendedor_responsavel}</p>
            </div>
          )}

          {cliente.regiao_atendimento && (
            <div>
              <p className="text-xs text-slate-500">Região</p>
              <Badge variant="outline" className="text-xs">{cliente.regiao_atendimento}</Badge>
            </div>
          )}

          {cliente.endereco_principal?.cidade && (
            <div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Endereço Principal
              </p>
              <p className="text-sm font-medium">
                {cliente.endereco_principal.cidade}, {cliente.endereco_principal.estado}
              </p>
              <p className="text-xs text-slate-600">
                {cliente.endereco_principal.logradouro}, {cliente.endereco_principal.numero}
              </p>
            </div>
          )}

          {cliente.contatos && cliente.contatos.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                <Phone className="w-3 h-3" />
                Contatos
              </p>
              <div className="space-y-1">
                {cliente.contatos.slice(0, 3).map((contato, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {contato.tipo === 'WhatsApp' && <MessageCircle className="w-3 h-3 text-green-600" />}
                    {contato.tipo === 'E-mail' && <Mail className="w-3 h-3 text-blue-600" />}
                    {contato.tipo === 'Telefone' && <Phone className="w-3 h-3 text-slate-600" />}
                    <p className="text-xs">{contato.valor}</p>
                    {contato.principal && <Badge className="bg-green-600 text-xs py-0">Principal</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financeiro */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">Limite de Crédito</p>
            <p className="text-xl font-bold text-green-600">
              R$ {(cliente.condicao_comercial?.limite_credito || 0).toLocaleString('pt-BR')}
            </p>
            {cliente.condicao_comercial?.limite_credito_utilizado > 0 && (
              <p className="text-xs text-slate-600">
                Utilizado: R$ {cliente.condicao_comercial.limite_credito_utilizado.toLocaleString('pt-BR')}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-500">Em Aberto</p>
            <p className={`text-lg font-semibold ${totalEmAberto > 0 ? 'text-orange-600' : 'text-slate-600'}`}>
              R$ {totalEmAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {cliente.condicao_comercial?.tabela_preco_nome && (
            <div>
              <p className="text-xs text-slate-500">Tabela de Preço</p>
              <Badge variant="outline" className="text-xs">
                {cliente.condicao_comercial.tabela_preco_nome}
              </Badge>
            </div>
          )}

          {cliente.condicao_comercial?.condicao_pagamento && (
            <div>
              <p className="text-xs text-slate-500">Condição de Pagamento</p>
              <p className="text-sm font-medium">{cliente.condicao_comercial.condicao_pagamento}</p>
            </div>
          )}

          {cliente.score_pagamento && (
            <div>
              <p className="text-xs text-slate-500">Score de Pagamento</p>
              <p className="text-2xl font-bold text-blue-600">{cliente.score_pagamento}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">Total em Vendas (12 meses)</p>
            <p className="text-xl font-bold text-purple-600">
              R$ {(cliente.valor_compras_12meses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Pedidos</p>
              <p className="text-lg font-semibold">{cliente.quantidade_pedidos || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Ticket Médio</p>
              <p className="text-lg font-semibold">
                R$ {(cliente.ticket_medio || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {cliente.classificacao_abc && (
            <div>
              <p className="text-xs text-slate-500">Classificação</p>
              <Badge className={
                cliente.classificacao_abc === 'A' ? 'bg-green-600' :
                cliente.classificacao_abc === 'B' ? 'bg-blue-600' :
                'bg-slate-600'
              }>
                Classe {cliente.classificacao_abc}
              </Badge>
            </div>
          )}

          {cliente.data_ultima_compra && (
            <div>
              <p className="text-xs text-slate-500">Última Compra</p>
              <p className="text-sm font-medium">
                {new Date(cliente.data_ultima_compra).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}