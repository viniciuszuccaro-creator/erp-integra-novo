import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import { FileText } from "lucide-react";
import ImportacaoProdutoNFe from "./ImportacaoProdutoNFe";

/**
 * V21.1.2-R2 - Botões de Importação de Produtos
 * ✅ Via NF-e
 * (Importação em lote e ERP mapeado desativadas temporariamente a pedido do cliente)
 */
export default function BotoesImportacaoProduto({ onProdutosCriados }) {
  const { openWindow } = useWindow();

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => openWindow(
            ImportacaoProdutoNFe,
            { windowMode: true, onProdutosCriados: (produtos) => { onProdutosCriados && onProdutosCriados(produtos); } },
            { title: 'Importar Produtos via NF-e', width: 1100, height: 800 }
          )}
          className="border-purple-300 hover:bg-purple-50"
        >
          <FileText className="w-4 h-4 mr-2" />
          Importar via NF-e
        </Button>
        

      </div>






    </>
  );
}