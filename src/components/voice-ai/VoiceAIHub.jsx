/**
 * VoiceAIHub v1.0
 * Hub central de controle por voz + NLP
 * Passo 32: Português 100% • Comandos naturais • IA embedding
 * Regra-Mãe: w-full, h-full, multi-empresa, real-time, acessibilidade
 */
import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Volume2, Brain, Activity } from 'lucide-react';
import VoiceCommandCenter from './VoiceCommandCenter';
import NLPProcessor from './NLPProcessor';
import VoiceAnalytics from './VoiceAnalytics';

export default function VoiceAIHub() {
  const [activeTab, setActiveTab] = useState('commands');
  const [empresa, setEmpresa] = useState('Zuccaro SP');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.continuous = false;
    }
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-blue-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg relative">
              <Mic className={`w-8 h-8 ${isListening ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
              {isListening && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Voice AI Hub</h1>
              <p className="text-sm text-slate-300">Português • Comandos Naturais • NLP Embarcado</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoiceToggle}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isListening ? '⏹ Ouvindo...' : '🎤 Falar'}
            </button>

            {/* Empresa */}
            <div className="flex gap-2">
              {empresas.map((emp) => (
                <button
                  key={emp}
                  onClick={() => setEmpresa(emp)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    empresa === emp
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {emp.replace('Zuccaro ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'commands', label: 'Comandos', icon: Mic },
              { value: 'nlp', label: 'NLP', icon: Brain },
              { value: 'analytics', label: 'Análise', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="commands" className="flex-1 m-0 overflow-auto">
            <VoiceCommandCenter empresa={empresa} isListening={isListening} />
          </TabsContent>
          <TabsContent value="nlp" className="flex-1 m-0 overflow-auto">
            <NLPProcessor empresa={empresa} />
          </TabsContent>
          <TabsContent value="analytics" className="flex-1 m-0 overflow-auto">
            <VoiceAnalytics empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}