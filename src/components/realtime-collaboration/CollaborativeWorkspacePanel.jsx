import React, { useState, useEffect } from 'react';
import { User, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/components/lib/UserContext';

export default function CollaborativeWorkspacePanel() {
  const { user } = useUser();
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // Simulated active users (em produção, usar WebSocket)
    const mockUsers = [
      { id: '1', name: 'João Silva', email: 'joao@empresa.com', status: 'online', lastAction: 'Editando Pedido #1203' },
      { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', status: 'online', lastAction: 'Visualizando Estoque' },
      { id: '3', name: 'Carlos Mendes', email: 'carlos@empresa.com', status: 'away', lastAction: 'Há 5 minutos' }
    ];
    setActiveUsers(mockUsers);
  }, []);

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {/* Usuários Ativos */}
      <Card className="bg-white border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Usuários Ativos ({activeUsers.filter(u => u.status === 'online').length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    u.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                  <p className="text-xs text-slate-600 truncate">{u.lastAction}</p>
                </div>
              </div>
              <Badge className={u.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {u.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card className="bg-white border-emerald-200">
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-start bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200">
            <MessageCircle className="w-4 h-4 mr-2" />
            Iniciar Chat em Grupo
          </Button>
          <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar com Usuários
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}