import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderAgendaCompacto({ totalEventos = 0 }) {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Agenda e Calendário" />
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-600 to-cyan-600">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Agenda e Calendário</h1>
                <p className="text-blue-100 text-xs">
                  {totalEventos > 0 ? `${totalEventos} eventos cadastrados` : 'Compromissos, reuniões e lembretes'}
                </p>
              </div>
            </div>
            <IAContextualModulo modulo="Agenda" compact />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}