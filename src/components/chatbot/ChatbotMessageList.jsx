import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Bot as BotIcon, User as UserIcon, Paperclip as PaperclipIcon } from 'lucide-react';

export default function ChatbotMessageList({ mensagensHistorico, processando, messagesEndRef, onSugestaoClick }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
      <AnimatePresence>
        {mensagensHistorico.map((msg, idx) => {
          const isCliente = msg.tipo_remetente === 'Cliente';
          const isBot = msg.tipo_remetente === 'Bot';
          return (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isCliente ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                isCliente ? 'bg-blue-600 text-white'
                : isBot ? 'bg-white border border-slate-200'
                : 'bg-purple-50 border border-purple-200'
              } rounded-lg p-3 shadow-sm`}>
                <div className="flex items-center gap-2 mb-1">
                  {isBot ? <BotIcon className="w-4 h-4 text-blue-600" />
                  : isCliente ? <UserIcon className="w-4 h-4" />
                  : <UserIcon className="w-4 h-4 text-purple-600" />}
                  <span className="text-xs font-semibold opacity-80">
                    {msg.remetente_nome || (isCliente ? 'Você' : 'Sistema')}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.mensagem}</p>
                {msg.midia_url && (
                  <a href={msg.midia_url} target="_blank" rel="noopener noreferrer"
                     className="mt-2 flex items-center gap-2 text-xs underline opacity-80">
                    <PaperclipIcon className="w-3 h-3" />
                    Arquivo anexado ({msg.midia_tamanho_kb}KB)
                  </a>
                )}
                {msg.sugestoes_acoes && msg.sugestoes_acoes.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {msg.sugestoes_acoes.map((sug, i) => (
                      <button key={i} onClick={() => onSugestaoClick(sug)}
                        className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded transition-colors">
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
                {msg.sentimento && msg.sentimento !== 'Neutro' && (
                  <Badge className={`mt-2 text-xs ${
                    msg.sentimento === 'Frustrado' ? 'bg-red-600' :
                    msg.sentimento === 'Urgente' ? 'bg-orange-600' : 'bg-green-600'
                  }`}>{msg.sentimento}</Badge>
                )}
                <p className="text-xs opacity-50 mt-1">
                  {new Date(msg.data_envio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {processando && (
        <div className="flex justify-start">
          <div className="bg-white border rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-slate-600">Processando...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}