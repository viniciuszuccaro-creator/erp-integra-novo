// Regra-Mãe 3: Extraído de BuscaDadosPublicos.jsx — endereço por CEP (ViaCEP + coordenadas OpenStreetMap)

export async function buscarEnderecoCEP(cep) {
  try {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      throw new Error('CEP inválido - deve ter 8 dígitos');
    }

    // 1. Buscar via ViaCEP
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!resposta.ok) {
      throw new Error('Erro ao buscar CEP na API ViaCEP');
    }

    const dadosViaCep = await resposta.json();

    if (dadosViaCep.erro) {
      throw new Error('CEP não encontrado');
    }

    // 2. Buscar coordenadas GPS via OpenStreetMap Nominatim
    const enderecoCompleto = `${dadosViaCep.logradouro}, ${dadosViaCep.bairro}, ${dadosViaCep.localidade}, ${dadosViaCep.uf}, Brasil`;
    const urlNominatim = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enderecoCompleto)}&format=json&limit=1`;

    let latitude = null;
    let longitude = null;

    try {
      const respostaGPS = await fetch(urlNominatim, {
        headers: {
          'User-Agent': 'ERP-Zuccaro/1.0'
        }
      });

      if (respostaGPS.ok) {
        const dadosGPS = await respostaGPS.json();
        if (dadosGPS && dadosGPS.length > 0) {
          latitude = parseFloat(dadosGPS[0].lat);
          longitude = parseFloat(dadosGPS[0].lon);
        }
      }
    } catch (erroGPS) {
      console.warn('Não foi possível obter coordenadas GPS:', erroGPS);
    }

    return {
      sucesso: true,
      dados: {
        logradouro: dadosViaCep.logradouro || '',
        bairro: dadosViaCep.bairro || '',
        cidade: dadosViaCep.localidade || '',
        uf: dadosViaCep.uf || '',
        latitude: latitude,
        longitude: longitude,
        ddd: dadosViaCep.ddd || ''
      }
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message || 'Erro ao buscar CEP'
    };
  }
}