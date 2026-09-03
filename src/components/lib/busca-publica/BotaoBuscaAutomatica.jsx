// Regra-Mãe 3: Extraído de BuscaDadosPublicos.jsx — Botão de Busca Automática V21.5
import React from 'react';
import { Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buscarDadosCNPJ } from './buscaCNPJ';
import { buscarDadosCPF } from './buscaCPF';
import { buscarEnderecoCEP } from './buscaCEP';
import { buscarDadosNCM } from './buscaNCM';
import { buscarDadosRNTRC } from './buscaRNTRC';

export function BotaoBuscaAutomatica({ tipo, valor, onDadosEncontrados, disabled }) {
  const [buscando, setBuscando] = React.useState(false);
  const [resultado, setResultado] = React.useState(null);

  const funcoesBusca = {
    cnpj: buscarDadosCNPJ,
    cpf: buscarDadosCPF,
    cep: buscarEnderecoCEP,
    ncm: buscarDadosNCM,
    rntrc: buscarDadosRNTRC
  };

  const labels = {
    cnpj: '🔍 Buscar CNPJ Real',
    cpf: '✅ Validar CPF',
    cep: '📍 Buscar CEP',
    ncm: '📊 Buscar NCM',
    rntrc: '🚛 Validar RNTRC'
  };

  const handleBuscar = async () => {
    if (!valor || valor.trim() === '') {
      setResultado({ sucesso: false, erro: 'Digite um valor válido' });
      return;
    }

    setBuscando(true);
    setResultado(null);

    try {
      const funcao = funcoesBusca[tipo];
      if (!funcao) {
        throw new Error('Tipo de busca inválido');
      }

      const res = await funcao(valor);
      setResultado(res);

      if (res.sucesso && onDadosEncontrados) {
        onDadosEncontrados(res.dados);
      }
    } catch (error) {
      setResultado({
        sucesso: false,
        erro: error.message || 'Erro ao buscar dados'
      });
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleBuscar}
        disabled={disabled || buscando || !valor}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {buscando ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Buscando na Receita...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            {labels[tipo] || 'Buscar'}
          </>
        )}
      </Button>

      {resultado && (
        <Alert className={resultado.sucesso ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
          {resultado.sucesso ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription className="text-xs">
            {resultado.sucesso ? (
              <div className="text-green-900">
                <p className="font-semibold">✅ Dados REAIS preenchidos!</p>
                {resultado.fonte && (
                  <p className="text-[10px] opacity-70 mt-1">Fonte: {resultado.fonte}</p>
                )}
              </div>
            ) : (
              <span className="text-red-900">{resultado.erro}</span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}