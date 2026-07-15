import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";

const scheduleSchema = z.object({
  frequencia: z.enum(['Diário', 'Semanal', 'Mensal']),
  dia_semana: z.string().optional(),
  dia_mes: z.string().optional(),
  hora: z.string().optional(),
  destinatarios: z.string().min(3, 'Informe ao menos um e-mail')
});

export default function AgendarRelatorioDialog({ open, onOpenChange, selectedReport, onSubmit, isPending = false }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Envio por E-mail</DialogTitle>
        </DialogHeader>
        <FormWrapper
          schema={scheduleSchema}
          defaultValues={{ frequencia: 'Semanal', dia_semana: 'Segunda', hora: '09:00', destinatarios: '' }}
          onSubmit={(values) => onSubmit({ ...values, relatorio: selectedReport?.titulo })}
        >
          {(methods) => (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <Mail className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm text-blue-900">Configure o envio automático deste relatório por e-mail</p>
              </div>

              <div>
                <Label>Relatório</Label>
                <p className="font-semibold">{selectedReport?.titulo}</p>
              </div>

              <div>
                <Label htmlFor="frequencia">Frequência *</Label>
                <Select
                  value={methods.watch('frequencia')}
                  onValueChange={(value) => methods.setValue('frequencia', value, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diário">Diário</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {methods.watch('frequencia') === 'Semanal' && (
                <div>
                  <Label htmlFor="dia_semana">Dia da Semana</Label>
                  <Select
                    value={methods.watch('dia_semana')}
                    onValueChange={(value) => methods.setValue('dia_semana', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Segunda','Terça','Quarta','Quinta','Sexta'].map(d => (
                        <SelectItem key={d} value={d}>{d}-feira</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {methods.watch('frequencia') === 'Mensal' && (
                <div>
                  <Label htmlFor="dia_mes">Dia do Mês</Label>
                  <Input id="dia_mes" type="number" min="1" max="28" {...methods.register('dia_mes')} />
                </div>
              )}

              <div>
                <Label htmlFor="hora">Horário</Label>
                <Input id="hora" type="time" {...methods.register('hora')} />
              </div>

              <div>
                <Label htmlFor="destinatarios">Destinatários * (separados por vírgula)</Label>
                <Textarea
                  id="destinatarios"
                  {...methods.register('destinatarios')}
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                  {isPending ? 'Agendando...' : 'Agendar'}
                </Button>
              </div>
            </div>
          )}
        </FormWrapper>
      </DialogContent>
    </Dialog>
  );
}