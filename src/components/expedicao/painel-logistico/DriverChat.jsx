import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";

export default function DriverChat({ entrega, onUpdated }) {
  const { user } = useUser();
  const [msg, setMsg] = useState("");
  const endRef = useRef(null);

  const mensagens = useMemo(() => {
    const arr = Array.isArray(entrega?.ocorrencias) ? entrega.ocorrencias : [];
    // Usa ocorrências como trilha de comunicação (tipo Outros)
    return arr
      .filter((o) => o && (o.tipo === 'Outros' || o.tipo === 'Comunicacao' || o.tipo === 'Mensagem'))
      .sort((a, b) => new Date(a.data_hora || 0) - new Date(b.data_hora || 0));
  }, [entrega?.ocorrencias]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens?.length]);

  const enviarMutation = useMutation({
    mutationFn: async (texto) => {
      const nova = {
        tipo: 'Outros',
        descricao: texto,
        data_hora: new Date().toISOString(),
        responsavel: user?.full_name || user?.email || 'Operador',
      };
      const ocorrencias = Array.isArray(entrega?.ocorrencias) ? [...entrega.ocorrencias, nova] : [nova];
      const res = await base44.entities.Entrega.update(entrega.id, { ocorrencias });
      return res;
    },
    onSuccess: (res) => {
      setMsg("");
      onUpdated?.(res);
    }
  });

  const handleSend = (e) => {
    e?.preventDefault?.();
    const texto = msg.trim();
    if (!texto) return;
    enviarMutation.mutate(texto);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 border-b bg-slate-50">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-600"/> Comunicação com Motorista
          {entrega?.motorista && (
            <Badge variant="outline" className="ml-auto text-xs">{entrega.motorista}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-2 p-3">
        {mensagens.length === 0 && (
          <div className="text-xs text-slate-500">Sem mensagens ainda. Envie uma atualização para o motorista.</div>
        )}
        {mensagens.map((m, idx) => {
          const isOperador = (m?.responsavel || '').toLowerCase() !== (entrega?.motorista || '').toLowerCase();
          return (
            <div key={idx} className={`flex ${isOperador ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isOperador ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                <div>{m.descricao}</div>
                <div className={`mt-1 text-[10px] ${isOperador ? 'text-blue-100' : 'text-slate-500'}`}>
                  {m.responsavel || (isOperador ? 'Operador' : 'Motorista')} • {new Date(m.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </CardContent>
      <form onSubmit={handleSend} className="border-t p-2 flex gap-2">
        <Input value={msg} onChange={(e)=>setMsg(e.target.value)} placeholder="Escreva uma mensagem..." className="flex-1" disabled={enviarMutation.isPending} />
        <RBACButton type="submit" module="Expedicao" action="enviar" disabled={!msg.trim() || enviarMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4"/>
        </RBACButton>
      </form>
    </Card>
  );
}