import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Paperclip, Download, Trash2 } from "lucide-react";

export default function DocumentosTab({ formData, setFormData, handleUploadDocumento, removerDocumento }) {
  const documentos = formData?.documentos || [];
  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Documentos do Cliente</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {["Contrato Social", "Certidão Negativa", "Inscrição Estadual", "Comprovante Endereço", "Referência Comercial", "Outros"].map((tipo) => (
          <Button key={tipo} type="button" variant="outline" onClick={() => handleUploadDocumento(tipo)} className="h-20">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-5 h-5" />
              <span className="text-xs">{tipo}</span>
            </div>
          </Button>
        ))}
      </div>

      {documentos.length === 0 ? (
        <Card className="p-8 text-center">
          <Paperclip className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum documento anexado</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {documentos.map((doc, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-6 gap-3 items-center">
                <div className="col-span-2">
                  <Label className="text-xs">Tipo</Label>
                  <p className="font-medium">{doc.tipo}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Arquivo</Label>
                  <p className="text-sm truncate">{doc.nome_arquivo}</p>
                </div>
                <div>
                  <Label className="text-xs">Validade</Label>
                  <Input
                    type="date"
                    value={doc.data_validade || ""}
                    onChange={(e) => {
                      setFormData((prev) => {
                        const novos = [...(prev.documentos || [])];
                        novos[index] = { ...novos[index], data_validade: e.target.value };
                        return { ...prev, documentos: novos };
                      });
                    }}
                    className="h-8 text-xs"
                  />
                  {doc.data_validade && <p className="text-xs text-slate-500 mt-1">⚠️ Alerta 30 dias antes</p>}
                </div>
                <div className="flex gap-1 justify-end">
                  <Button type="button" variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removerDocumento(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}