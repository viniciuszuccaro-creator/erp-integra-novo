import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

export default function ConfigTabSeguranca({ user }) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50"><CardTitle>Segurança da Conta</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 font-semibold mb-2">Informações da Conta</p>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>E-mail:</strong> {user?.email}</p>
              <p><strong>Função:</strong> {user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
              <p><strong>Conta criada em:</strong> {user?.created_date ? new Date(user.created_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline" className="w-full" disabled><Lock className="w-4 h-4 mr-2" />Alterar Senha</Button>
            <p className="text-xs text-slate-500 mt-2 text-center">Entre em contato com o administrador do sistema</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50"><CardTitle>Sessões Ativas</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-slate-900">Sessão Atual</p><p className="text-sm text-slate-600">Navegador Web</p></div>
              <Badge className="bg-green-100 text-green-700">Ativa</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}