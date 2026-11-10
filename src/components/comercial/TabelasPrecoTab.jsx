import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DollarSign, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

/**
 * V21.1.2 - TAB DE TABELAS DE PREÇO NO COMERCIAL
 * Apenas visualização - gerenciamento completo está em Cadastros
 */
export default function TabelasPrecoTab() {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <AlertDescription>
          <p className="font-semibold text-blue-900 mb-2">
            💰 Tabelas de Preço - Hub Centralizado V21.1.2
          </p>
          <p className="text-sm text-blue-800 mb-3">
            As Tabelas de Preço agora são gerenciadas exclusivamente no <strong>Hub de Cadastros</strong>.
            Aqui você apenas visualiza quais estão ativas e consome os preços nos pedidos.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to={createPageUrl('Cadastros')}>
              <DollarSign className="w-4 h-4 mr-2" />
              Ir para Cadastros - Tabelas de Preço
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </AlertDescription>
      </Alert>

      <div className="text-center py-12 text-slate-500">
        <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-semibold mb-2">Gerenciamento Centralizado</p>
        <p className="text-sm">
          Para criar, editar ou configurar tabelas de preço, acesse:<br />
          <strong>Cadastros Gerais → Produtos e Serviços → Tabelas de Preço</strong>
        </p>
      </div>
    </div>
  );
}