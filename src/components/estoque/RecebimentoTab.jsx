import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import RecebimentoForm from "./RecebimentoForm";
import useRecebimentoTab from "@/components/estoque/recebimento-tab/useRecebimentoTab";
import RecebimentoTable from "@/components/estoque/recebimento-tab/RecebimentoTable";

export default function RecebimentoTab({ recebimentos, ordensCompra, produtos }) {
  const { openWindow } = useWindow();
  const { canCreate } = usePermissions();
  const h = useRecebimentoTab(recebimentos, ordensCompra, produtos);

  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <RecebimentoTable
          recebimentos={recebimentos}
          searchTerm={h.searchTerm}
          setSearchTerm={h.setSearchTerm}
          filteredRecebimentos={h.filteredRecebimentos}
          statusColors={h.statusColors}
          setViewingRecebimento={h.setViewingRecebimento}
        />
        {canCreate("Estoque", "Recebimento") && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() =>
              openWindow(
                RecebimentoForm,
                {
                  windowMode: true,
                  onSubmit: async (data) => {
                    await h.createMutation.mutateAsync(data);
                  },
                },
                { title: "📦 Novo Recebimento", width: 1000, height: 700 }
              )
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Recebimento
          </Button>
        )}
      </div>
    </div>
  );
}