import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Bot, User, Phone, AlertCircle } from 'lucide-react';
import useChatbotWidget from './useChatbotWidget';
import ChatbotMessageList from './ChatbotMessageList';
import ChatbotInputArea from './ChatbotInputArea';
import ChatbotEvaluation from './ChatbotEvaluation';

/**
 * V21.5 FINAL - Widget de Chatbot OMNICANAL AVANÇADO
 * REFACTORED (Regra-Mãe): 784 → ~110 linhas
 * Lógica em useChatbotWidget, UI em ChatbotMessageList / ChatbotInputArea / ChatbotEvaluation
 */
export default function ChatbotWidgetAvancado({
  clienteId, canal = 'Portal', conversaId: conversaIdProp,
  exibirBotaoFlutuante = true, configuracoes = {}, tema = 'light', habilitarAvaliacao = true
}) {
  const {
    aberto, setAberto, mensagemAtual, setMensagemAtual, processando, arquivoAnexo, setArquivoAnexo,
    exibirAvaliacao, setExibirAvaliacao, avaliacaoSelecionada, messagesEndRef, fileInputRef,
    mensagensHistorico, conversaTransferida, handleEnviar, handleSugestaoClick, handleAnexarArquivo, handleAvaliar
  } = useChatbotWidget({ clienteId, canal, conversaId: conversaIdProp, configuracoes });

  if (!aberto && exibirBotaoFlutuante) {
    const naoLidas = mensagensHistorico.filter(m => !m.lida && m.tipo_remetente !== 'Cliente').length;
    return (
      <motion.button onClick={() => setAberto(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all z-50 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
        {naoLidas > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{naoLidas}</div>}
      </motion.button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`${exibirBotaoFlutuante ? 'fixed bottom-6 right-6' : 'relative'} w-full max-w-md ${exibirBotaoFlutuante ? 'h-[600px]' : 'h-full'} bg-white rounded-2xl shadow-2xl border-2 border-slate-200 flex flex-col z-50 overflow-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              {conversaTransferida ? <User className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
            </div>
            {conversaTransferida && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />}
          </div>
          <div>
            <p className="font-bold text-lg">{conversaTransferida ? 'Atendente Humano' : 'Assistente Virtual'}</p>
            <p className="text-xs opacity-90 flex items-center gap-1">
              {conversaTransferida ? (<><div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />Online • Responde em instantes</>) : (<>🤖 Powered by IA • Respostas instantâneas</>)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversaTransferida && <Badge className="bg-orange-500 text-xs px-2 py-1"><Phone className="w-3 h-3 mr-1" />Humano</Badge>}
          {exibirBotaoFlutuante && (
            <button onClick={() => { if (habilitarAvaliacao && !exibirAvaliacao) setExibirAvaliacao(true); else setAberto(false); }} className="hover:bg-white/20 rounded-lg p-2 transition-colors"><X className="w-5 h-5" /></button>
          )}
        </div>
      </div>

      {/* Alerta de transferência */}
      {conversaTransferida && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200 p-3 text-sm text-orange-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <span className="flex-1"><strong>Transbordo ativado!</strong> Um especialista assumiu a conversa.</span>
        </motion.div>
      )}

      {exibirAvaliacao ? (
        <ChatbotEvaluation avaliacaoSelecionada={avaliacaoSelecionada} handleAvaliar={handleAvaliar} onPular={() => setExibirAvaliacao(false)} />
      ) : (
        <>
          <ChatbotMessageList mensagensHistorico={mensagensHistorico} processando={processando} handleSugestaoClick={handleSugestaoClick} messagesEndRef={messagesEndRef} />
          <ChatbotInputArea mensagemAtual={mensagemAtual} setMensagemAtual={setMensagemAtual} handleEnviar={handleEnviar} processando={processando}
            arquivoAnexo={arquivoAnexo} setArquivoAnexo={setArquivoAnexo} fileInputRef={fileInputRef} handleAnexarArquivo={handleAnexarArquivo}
            conversaTransferida={conversaTransferida} canal={canal} />
        </>
      )}
    </motion.div>
  );
}