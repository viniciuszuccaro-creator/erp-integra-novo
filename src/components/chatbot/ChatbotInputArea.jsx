import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X } from "lucide-react";

/**
 * Sub-componente extraído de ChatbotWidgetAvancado.jsx
 * Área de input com anexo de arquivos e envio de mensagens.
 */
export default function ChatbotInputArea({
  mensagemAtual, setMensagemAtual, handleEnviar, processando,
  arquivoAnexo, setArquivoAnexo, fileInputRef, handleAnexarArquivo,
  conversaTransferida, canal
}) {
  return (
    <div className="border-t-2 border-slate-200 p-4 bg-white">
      {arquivoAnexo && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-3 flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <Paperclip className="w-5 h-5 text-blue-600" />
          <span className="flex-1 truncate font-medium text-blue-900">{arquivoAnexo.name}</span>
          <button onClick={() => setArquivoAnexo(null)} className="text-red-600 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"><X className="w-5 h-5" /></button>
        </motion.div>
      )}
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleAnexarArquivo} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
        <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={processando} className="flex-shrink-0 hover:bg-blue-50 hover:border-blue-300 transition-colors" title="Anexar arquivo"><Paperclip className="w-5 h-5" /></Button>
        <Input value={mensagemAtual} onChange={(e) => setMensagemAtual(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleEnviar()} placeholder="Digite sua mensagem..." disabled={processando} className="flex-1 border-2 focus:border-blue-500 transition-colors" />
        <Button onClick={handleEnviar} disabled={processando || (!mensagemAtual.trim() && !arquivoAnexo)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0 shadow-lg hover:shadow-xl transition-all"><Send className="w-5 h-5" /></Button>
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 mt-3 text-center">
        {conversaTransferida ? (<>🟢 <strong>Atendimento humano</strong> • Resposta em instantes</>) : (<>🤖 <strong>Assistente IA</strong> • Respostas instantâneas • {canal}</>)}
      </motion.p>
    </div>
  );
}