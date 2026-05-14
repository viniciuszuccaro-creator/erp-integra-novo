import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderHubCompacto() {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Hub de Atendimento" />
      <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-600 to-indigo-600">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Hub de Atendimento</h1>
                <p className="text-violet-100 text-xs">Omnichannel, chatbot IA e SLA em tempo real</p>
              </div>
            </div>
            <IAContextualModulo modulo="Hub Atendimento" compact />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}