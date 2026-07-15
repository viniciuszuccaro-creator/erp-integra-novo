import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Paperclip, Send } from 'lucide-react';

export default function ChatbotInputArea({
  mensagemAtual, setMensagemAtual, handleEnviar, processando, arquivoAnexo, setArquivoAnexo,
  fileInputRef, handleAnexarArquivo, conversaTransferida,
}) {
  return (
    <div className="border-t p-3 bg-white rounded-b-lg">
      {arquivoAnexo && (
        <div className="mb-2 flex items-center gap-2 text-sm bg-slate-100 p-2 rounded">
          <Paperclip className="w-4 h-4" />
          <span className="flex-1 truncate">{arquivoAnexo.name}</span>
          <button onClick={() => setArquivoAnexo(null)} className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleAnexarArquivo}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}
          disabled={processando} className="flex-shrink-0">
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input value={mensagemAtual} onChange={(e) => setMensagemAtual(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleEnviar()}
          placeholder="Digite sua mensagem..." disabled={processando} className="flex-1" />
        <Button onClick={handleEnviar} disabled={processando || (!mensagemAtual.trim() && !arquivoAnexo)}
          className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        {conversaTransferida
          ? <>🟢 Atendido por humano • Respostas em instantes</>
          : <>🤖 Assistente IA • Respostas instantâneas</>}
      </p>
    </div>
  );
}