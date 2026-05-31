import React, { useState } from 'react';
import { MessageSquare, Plus, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CollaborativeNotesPanel() {
  const [notes, setNotes] = useState([
    {
      id: '1',
      autor: 'João Silva',
      conteudo: 'Revisar políticas de desconto para Q2. Cliente importante solicitou ajustes.',
      timestamp: '2026-05-31 14:30',
      relevancia: 'alta'
    },
    {
      id: '2',
      autor: 'Maria Santos',
      conteudo: 'Estoque de produtos A está baixo. Considerar reposição urgente.',
      timestamp: '2026-05-31 13:15',
      relevancia: 'média'
    },
    {
      id: '3',
      autor: 'Carlos Mendes',
      conteudo: 'Seguimento com cliente XYZ agendado para próxima semana.',
      timestamp: '2026-05-31 10:45',
      relevancia: 'baixa'
    }
  ]);

  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [{
        id: String(Date.now()),
        autor: 'Você',
        conteudo: newNote,
        timestamp: new Date().toLocaleString('pt-BR'),
        relevancia: 'média'
      }, ...prev]);
      setNewNote('');
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {/* Adicionar Nota */}
      <Card className="bg-white border-emerald-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            Nova Anotação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Compartilhe insights, ações ou observações com sua equipe..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="border-emerald-200"
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Publicar Anotação
          </Button>
        </CardContent>
      </Card>

      {/* Anotações */}
      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id} className="bg-white border-slate-200 hover:border-emerald-300 transition">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {note.autor.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-900 text-sm">{note.autor}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      note.relevancia === 'alta' ? 'bg-red-50 text-red-700' :
                      note.relevancia === 'média' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-slate-50 text-slate-700'
                    }`}>
                      {note.relevancia}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm mb-2">{note.conteudo}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {note.timestamp}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}