import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

/**
 * Sub-componente extraído de ChatbotWidgetAvancado.jsx
 * Tela de avaliação de satisfação (CSAT) do chatbot.
 */
export default function ChatbotEvaluation({ avaliacaoSelecionada, handleAvaliar, onPular }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto"><Star className="w-8 h-8 text-white" /></div>
        <h3 className="text-xl font-bold text-slate-900">Como foi o atendimento?</h3>
        <p className="text-sm text-slate-600">Sua opinião nos ajuda a melhorar!</p>
        <div className="flex gap-2 justify-center mt-6">
          {[1, 2, 3, 4, 5].map((nota) => (
            <motion.button key={nota} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => handleAvaliar(nota)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${avaliacaoSelecionada === nota ? 'bg-yellow-400 text-white scale-125' : 'bg-white border-2 border-slate-200 hover:border-yellow-400 text-slate-400 hover:text-yellow-400'}`}>
              <Star className={`w-6 h-6 ${avaliacaoSelecionada === nota ? 'fill-current' : ''}`} />
            </motion.button>
          ))}
        </div>
        <Button variant="outline" onClick={onPular} className="mt-4">Pular</Button>
      </div>
    </div>
  );
}