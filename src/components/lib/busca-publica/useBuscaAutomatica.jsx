// Regra-Mãe 3: Extraído de BuscaDadosPublicos.jsx — Hook customizado para busca automática
import React from 'react';
import { buscarDadosCNPJ } from './buscaCNPJ';
import { buscarDadosCPF } from './buscaCPF';
import { buscarEnderecoCEP } from './buscaCEP';
import { buscarDadosNCM } from './buscaNCM';
import { buscarDadosRNTRC } from './buscaRNTRC';

export function useBuscaAutomatica(tipo) {
  const [buscando, setBuscando] = React.useState(false);
  const [dados, setDados] = React.useState(null);
  const [erro, setErro] = React.useState(null);

  const buscar = async (valor) => {
    setBuscando(true);
    setErro(null);
    setDados(null);

    const funcoesBusca = {
      cnpj: buscarDadosCNPJ,
      cpf: buscarDadosCPF,
      cep: buscarEnderecoCEP,
      ncm: buscarDadosNCM,
      rntrc: buscarDadosRNTRC
    };

    const funcao = funcoesBusca[tipo];
    if (!funcao) {
      setErro('Tipo de busca inválido');
      setBuscando(false);
      return;
    }

    const resultado = await funcao(valor);

    if (resultado.sucesso) {
      setDados(resultado.dados);
    } else {
      setErro(resultado.erro);
    }

    setBuscando(false);
    return resultado;
  };

  return { buscar, buscando, dados, erro };
}