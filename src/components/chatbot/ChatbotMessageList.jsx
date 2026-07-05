import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, ImageIcon, FileText } from "lucide-react";
import { Badge as UIBadge } from "@/components/ui/badge";

/**
 * Sub-componente extraído de ChatbotWidgetAvancado.jsx
 * Renderiza a lista de mensagens + indicador de processamento IA.
 */
export default function ChatbotMessageList({ mensagensHistorico, processando, handleSugestaoClick, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50">
      <AnimatePresence>
        {mensagensHistorico.map((msg, idx) => {
          const isCliente = msg.tipo_remetente === 'Cliente';
          const isBot = msg.tipo_remetente === 'Bot';
          return (
            <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex ${isCliente ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${isCliente ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : isBot ? 'bg-white border-2 border-slate-200 text-slate-900' : 'bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 text-purple-900'} rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all`}>
                <div className="flex items-center gap-2 mb-2">
                  {isBot ? <Bot className="w-4 h-4 text-blue-600" /> : isCliente ? <User className="w-4 h-4" /> : <User className="w-4 h-4 text-purple-600" />}
                  <span className="text-xs font-semibold opacity-90">{msg.remetente_nome || (isCliente ? 'Você' : 'Sistema')}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.mensagem}</p>
                {msg.midia_url && (
                  <a href={msg.midia_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 text-xs underline opacity-80 hover:opacity-100 transition-opacity">
                    {msg.tipo_conteudo === 'imagem' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    Arquivo anexado ({msg.midia_tamanho_kb}KB)
                  </a>
                )}
                {msg.sugestoes_acoes?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.sugestoes_acoes.map((sug, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSugestaoClick(sug)} className="block w-full text-left text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors font-medium shadow-sm">{sug}</motion.button>
                    ))}
                  </div>
                )}
                {msg.sentimento && msg.sentimento !== 'Neutro' && (
                  <UIBadge className={`mt-2 text-xs ${msg.sentimento === 'Frustrado' ? 'bg-red-600' : msg.sentimento === 'Urgente' ? 'bg-orange-600' : 'bg-green-600'}`}>{msg.sentimento}</UIBadge>
                )}
                <p className="text-xs opacity-60 mt-2">{new Date(msg.data_envio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {processando && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-lg">
            <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div><span className="text-sm text-slate-600">Processando com IA...</span></div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}