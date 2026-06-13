import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Paperclip, ExternalLink } from "lucide-react";

export default function ClienteAnexosTab({ formData, setFormData }) {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
        <Paperclip className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600 mb-2">Upload de Documentos</p>
        <p className="text-sm text-slate-500 mb-4">
          Arraste arquivos ou clique para fazer upload
        </p>
        <Button variant="outline">
          Selecionar Arquivos
        </Button>
      </div>

      {formData.documentos && formData.documentos.length > 0 && (
        <div className="space-y-2">
          {formData.documentos.map((doc, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.nome_arquivo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{doc.tipo}</Badge>
                        {doc.data_upload && (
                          <span className="text-xs text-slate-500">
                            {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {doc.upload_por && (
                          <span className="text-xs text-slate-500">
                            por {doc.upload_por}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doc.url_arquivo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.url_arquivo, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}