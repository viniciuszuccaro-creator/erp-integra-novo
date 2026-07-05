import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Factory } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFormularioOP from "@/components/producao/formulario-op/useFormularioOP";
import OPTabGeral from "@/components/producao/formulario-op/OPTabGeral";
import OPTabMateriaPrima from "@/components/producao/formulario-op/OPTabMateriaPrima";

/**
 * V21.6 - FORMULÁRIO DE ORDEM DE PRODUÇÃO COMPLETO
 * P2: Multi-tenant | P3: RBAC (data-permission)
 * Refatorado em sub-componentes (Regra-Mãe)
 */
export default function FormularioOrdemProducao({ op, onClose }) {
  const {
    formData, setFormData,
    pedidos, empresas, produtosProducao,
    seletorProdutoAberto, setSeletorProdutoAberto,
    produtosInsuficientes,
    saveMutation,
    handleGerarIA, adicionarProduto, atualizarQuantidadeItem, removerItem, handleSubmit,
  } = useFormularioOP(op, onClose);

  return (
    <div className="h-full flex flex-col bg-white w-full">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="geral" className="h-full">
            <TabsList>
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="materiaprima"><Factory className="w-4 h-4 mr-2" />Matéria-Prima</TabsTrigger>
              <TabsTrigger value="engenharia">Engenharia</TabsTrigger>
              <TabsTrigger value="apontamentos">Apontamentos</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-4">
              <OPTabGeral formData={formData} setFormData={setFormData} pedidos={pedidos} empresas={empresas} onGerarIA={handleGerarIA} />
            </TabsContent>

            <TabsContent value="materiaprima" className="space-y-4 mt-4">
              <OPTabMateriaPrima
                formData={formData} produtosProducao={produtosProducao} produtosInsuficientes={produtosInsuficientes}
                seletorProdutoAberto={seletorProdutoAberto} setSeletorProdutoAberto={setSeletorProdutoAberto}
                adicionarProduto={adicionarProduto} atualizarQuantidadeItem={atualizarQuantidadeItem} removerItem={removerItem}
              />
            </TabsContent>

            <TabsContent value="engenharia">
              <Card>
                <CardHeader><CardTitle className="text-sm">Detalhamento de Peças</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-600">Detalhamento de engenharia, mapas de corte e sequenciamento serão gerenciados aqui.</p></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apontamentos">
              <Card>
                <CardHeader><CardTitle className="text-sm">Apontamentos de Produção</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-600">Histórico de apontamentos, operadores, máquinas e progresso físico.</p></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t p-4 bg-slate-50 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" data-permission="Producao.OrdemProducao.visualizar" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saveMutation.isPending} data-permission="Producao.OrdemProducao.criar" className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar OP"}
          </Button>
        </div>
      </form>
    </div>
  );
}