import { z } from 'zod';

export const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['Pessoa Física','Pessoa Jurídica'], { required_error: 'Selecione o tipo de pessoa' }),
  cpf_cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  cep: z.string().optional(),
  limite_credito: z.preprocess((v) => (v === '' || v === null || v === undefined) ? 0 : Number(v), z.number().min(0, 'Limite inválido')),
  condicao_pagamento: z.string().optional(),
  status: z.enum(['Prospect','Ativo','Inativo','Bloqueado']).optional(),
});