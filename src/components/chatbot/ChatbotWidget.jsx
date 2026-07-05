import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Bot, User, Phone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import useChatbotWidget from './useChatbotWidget';
import ChatbotMessageList from './ChatbotMessageList';
import ChatbotInputArea from './ChatbotInputArea';

export default function ChatbotWidget({
  clienteId, canal = 'Portal', conversaId: conversaIdProp,
  exibirBotaoFlutuante = true, configuracoes = {}
}) {
  const {
    aberto, setAberto, mensagemAtual, setMensagemAtual, processando, arquivoAnexo, setArquivoAnexo,
    mensagensHistorico, messagesEndRef, fileInputRef, handleEnviar, handleSugestaoClick, handleAnexarArquivo,
    conversaTransferida,
  } = useChatbotWidget({ clienteId, canal, conversaId: conversaIdProp, exibirBotaoFlutuante });

  if (!aberto && exibirBotaoFlutuante) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2"
        data-permission="Chatbot.Widget.acessar"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`${exibirBotaoFlutuante ? 'fixed bottom-6 right-6' : 'relative'} w-full max-w-md ${exibirBotaoFlutuante ? 'h-[600px]' : 'h-full'} bg-white rounded-lg shadow-2xl border flex flex-col z-50`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {conversaTransferida ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </div>
          <div>
            <p className="font-semibold">{conversaTransferida ? 'Atendente' : 'Assistente Virtual'}</p>
            <p className="text-xs opacity-90 flex items-center gap-1">
              {conversaTransferida ? (
                <><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />Online</>
              ) : 'Powered by IA'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversaTransferida && (
            <Badge className="bg-orange-500 text-xs"><Phone className="w-3 h-3 mr-1" />Atendente</Badge>
          )}
          {exibirBotaoFlutuante && (
            <button onClick={() => setAberto(false)} className="hover:bg-white/20 rounded p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {conversaTransferida && (
        <div className="bg-orange-50 border-b border-orange-200 p-2 text-sm text-orange-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Conversa transferida para atendimento humano</span>
        </div>
      )}

      <ChatbotMessageList
        mensagensHistorico={mensagensHistorico}
        processando={processando}
        messagesEndRef={messagesEndRef}
        onSugestaoClick={handleSugestaoClick}
      />

      <ChatbotInputArea
        mensagemAtual={mensagemAtual}
        setMensagemAtual={setMensagemAtual}
        handleEnviar={handleEnviar}
        processando={processando}
        arquivoAnexo={arquivoAnexo}
        setArquivoAnexo={setArquivoAnexo}
        fileInputRef={fileInputRef}
        handleAnexarArquivo={handleAnexarArquivo}
        conversaTransferida={conversaTransferida}
      />
    </motion.div>
  );
}