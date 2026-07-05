import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Edit, Trash2, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

export default function FormasPagamentoTabela({
  formasFiltradas,
  toggleAtivaMutation,
  handleEditar,
  confirm,
  deleteMutation,
  podeEditar,
  podeExcluir,
  contextoValido
}) {
  return (
    <Card className="border-0 shadow-md w-full h-full">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle>Formas Cadastradas ({formasFiltradas.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-12">
                <ArrowUpDown className="w-4 h-4" />
              </TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Acréscimo</TableHead>
              <TableHead>Parcelamento</TableHead>
              <TableHead>Disponibilidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formasFiltradas.map((forma) => (
              <TableRow key={forma.id}>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {forma.ordem_exibicao}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{forma.icone}</span>
                    <div>
                      <p className="font-semibold">{forma.descricao}</p>
                      <p className="text-xs text-slate-500">{forma.codigo}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{forma.tipo}</Badge>
                </TableCell>
                <TableCell>
                  {forma.aceita_desconto && forma.percentual_desconto_padrao > 0 ? (
                    <Badge className="bg-green-100 text-green-700">
                      -{forma.percentual_desconto_padrao}%
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {forma.aplicar_acrescimo && forma.percentual_acrescimo_padrao > 0 ? (
                    <Badge className="bg-orange-100 text-orange-700">
                      +{forma.percentual_acrescimo_padrao}%
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {forma.permite_parcelamento ? (
                    <Badge className="bg-purple-100 text-purple-700">
                      Até {forma.maximo_parcelas}x
                    </Badge>
                  ) : (
                    <span className="text-slate-400">Não</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {forma.disponivel_pdv && <Badge className="bg-blue-100 text-blue-700 text-xs">PDV</Badge>}
                    {forma.disponivel_ecommerce && <Badge className="bg-green-100 text-green-700 text-xs">Web</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    data-permission="Cadastros.FormaPagamento.editar"
                    onClick={() => toggleAtivaMutation.mutate({ id: forma.id, ativa: !forma.ativa })}
                    disabled={!contextoValido || !podeEditar || toggleAtivaMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    {forma.ativa ? (
                      <Badge className="bg-green-600 cursor-pointer hover:bg-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600 cursor-pointer hover:bg-red-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inativa
                      </Badge>
                    )}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      data-permission="Cadastros.FormaPagamento.editar"
                      onClick={() => handleEditar(forma)}
                      disabled={!contextoValido || !podeEditar}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-permission="Cadastros.FormaPagamento.excluir"
                      onClick={async () => {
                        const ok = await confirm({ title: "Excluir Forma de Pagamento", description: `Excluir "${forma.descricao}"?`, variant: "danger", confirmText: "Excluir" });
                        if (ok) deleteMutation.mutate(forma.id);
                      }}
                      disabled={!podeExcluir || deleteMutation.isPending}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {formasFiltradas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhuma forma de pagamento encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}