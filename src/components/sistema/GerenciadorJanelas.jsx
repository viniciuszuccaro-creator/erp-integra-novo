import React from 'react';
import { useWindowManager } from '@/components/lib/WindowManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  X,
  Maximize2,
  Minimize2,
  Eye,
  AlertCircle,
  CheckCircle2 } from
'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * V21.0 FASE 1: GERENCIADOR VISUAL DE JANELAS
 * Painel de controle para visualizar e gerenciar todas as janelas abertas
 */
export default function GerenciadorJanelas() {
  const {
    windows,
    activeWindowId,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    bringToFront
  } = useWindowManager();

  const totalWindows = windows.length;
  const minimizedCount = windows.filter((w) => w.isMinimized).length;
  const activeCount = windows.filter((w) => !w.isMinimized).length;
  const maximizedCount = windows.filter((w) => w.isMaximized).length;

  if (totalWindows === 0) {
    return null;











  }

  return (
    <Card className="border-2 border-blue-300 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Gerenciador de Janelas
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-blue-600 text-white">{totalWindows} total</Badge>
            <Badge className="bg-green-600 text-white">{activeCount} ativas</Badge>
            {minimizedCount > 0 &&
            <Badge className="bg-orange-600 text-white">{minimizedCount} minimizadas</Badge>
            }
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <AnimatePresence>
          {windows.map((window) => {
            const isActive = window.id === activeWindowId;

            return (
              <motion.div
                key={window.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                isActive ?
                'border-blue-500 bg-blue-50 shadow-lg' :
                'border-slate-200 bg-white hover:bg-slate-50'}`
                }>
                
                <div className="flex items-center gap-3 flex-1">
                  {isActive && <Eye className="w-4 h-4 text-blue-600" />}
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">{window.title}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {window.width}×{window.height}
                      </span>
                      {window.isMinimized &&
                      <Badge variant="outline" className="text-xs">Minimizada</Badge>
                      }
                      {window.isMaximized &&
                      <Badge variant="outline" className="text-xs">Maximizada</Badge>
                      }
                      <span className="text-xs text-slate-400">z-index: {window.zIndex}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  {window.isMinimized ?
                  <Button
                    size="sm"
                    variant="ghost"
                    data-permission="Sistema.Janela.gerenciar"
                    onClick={() => restoreWindow(window.id)}
                    title="Restaurar">
                    
                      <Maximize2 className="w-4 h-4 text-green-600" />
                    </Button> :

                  <Button
                    size="sm"
                    variant="ghost"
                    data-permission="Sistema.Janela.gerenciar"
                    onClick={() => minimizeWindow(window.id)}
                    title="Minimizar">
                    
                      <Minimize2 className="w-4 h-4 text-orange-600" />
                    </Button>
                  }
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    data-permission="Sistema.Janela.gerenciar"
                    onClick={() => toggleMaximize(window.id)}
                    title={window.isMaximized ? 'Restaurar' : 'Maximizar'}>
                    
                    <Maximize2 className="w-4 h-4 text-blue-600" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    data-permission="Sistema.Janela.gerenciar"
                    onClick={() => bringToFront(window.id)}
                    title="Trazer para frente"
                    disabled={isActive}>
                    
                    <Eye className="w-4 h-4 text-purple-600" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    data-permission="Sistema.Janela.gerenciar"
                    onClick={() => closeWindow(window.id)}
                    title="Fechar">
                    
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </motion.div>);

          })}
        </AnimatePresence>

        <Alert className="border-green-300 bg-green-50 mt-4">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-xs text-green-900">
            <strong>FASE 1 ATIVA:</strong> Sistema de multitarefas operacional. 
            Clique nas janelas para trazê-las para frente, redimensione e mova livremente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>);

}