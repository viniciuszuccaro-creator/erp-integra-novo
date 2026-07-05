import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, TrendingUp, X } from "lucide-react";
import { motion } from "framer-motion";
import useDetalhesFornecedor from "@/components/compras/detalhes-fornecedor/useDetalhesFornecedor";
import TabHistoricoCompras from "@/components/compras/detalhes-fornecedor/TabHistoricoCompras";
import TabCondicoesComerciais from "@/components/compras/detalhes-fornecedor/TabCondicoesComerciais";
import TabDocumentosPagamentos from "@/components/compras/detalhes-fornecedor/TabDocumentosPagamentos";

/**
 * V21.1.2 - WINDOW MODE READY
 * P2: Multi-tenant — usa filterInContext
 * P3: RBAC via canEdit + data-permission
 * Refatorado: lógica em useDetalhesFornecedor, tabs em sub-componentes
 */
export default function DetalhesFornecedor({ fornecedor, onClose, windowMode = false }) {
  const h = useDetalhesFornecedor({ fornecedor });

  const content = (
    <div className={windowMode ? 'w-full h-full overflow-auto bg-white p-4' : ''}>
      <Card className={windowMode ? 'border shadow-sm' : 'border-0 shadow-none m-4'}>
        <CardHeader className="border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{fornecedor.nome}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {fornecedor.categoria} • {fornecedor.cnpj || '-'}
              </p>
            </div>
            {!windowMode && (
              <Button variant="ghost" size="icon" onClick={onClose} data-permission="Compras.Fornecedor.visualizar" data-action="Compras.Fornecedor.fechar">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={h.activeTab} onValueChange={h.setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="historico">
                <FileText className="w-4 h-4 mr-2" />
                Histórico de Compras
              </TabsTrigger>
              <TabsTrigger value="condicoes">
                <TrendingUp className="w-4 h-4 mr-2" />
                Condições Comerciais
              </TabsTrigger>
              <TabsTrigger value="documentos">
                <DollarSign className="w-4 h-4 mr-2" />
                Documentos e Pagamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="historico">
              <TabHistoricoCompras
                ordensCompra={h.ordensCompra}
                notasFiscais={h.notasFiscais}
                totalCompras={h.totalCompras}
              />
            </TabsContent>

            <TabsContent value="condicoes">
              <TabCondicoesComerciais
                fornecedor={fornecedor}
                prazoMedioEntrega={h.prazoMedioEntrega}
                canEdit={h.canEdit}
              />
            </TabsContent>

            <TabsContent value="documentos">
              <TabDocumentosPagamentos
                fornecedor={fornecedor}
                contasPagar={h.contasPagar}
                valorPendente={h.valorPendente}
                valorPago={h.valorPago}
                showDocumentoDialog={h.showDocumentoDialog}
                setShowDocumentoDialog={h.setShowDocumentoDialog}
                documentoForm={h.documentoForm}
                setDocumentoForm={h.setDocumentoForm}
                onAdicionarDocumento={h.handleAdicionarDocumento}
                onRemoverDocumento={h.handleRemoverDocumento}
                canEdit={h.canEdit}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  if (windowMode) return content;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-slate-50"
    >
      {content}
    </motion.div>
  );
}