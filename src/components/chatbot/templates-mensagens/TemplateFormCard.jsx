import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateFormCard({
  exibirForm, editando, novoTemplate, setNovoTemplate,
  categorias, variaveisDisponiveis, substituirVariaveis,
  onSalvar, onReset, isPending,
}) {
  if (!exibirForm) return null;

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            {editando ? 'Editar Template' : 'Novo Template'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Nome</label>
              <Input value={novoTemplate.nome} onChange={(e) => setNovoTemplate({ ...novoTemplate, nome: e.target.value })} placeholder="Ex: Saudação Padrão" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Categoria</label>
              <select value={novoTemplate.categoria} onChange={(e) => setNovoTemplate({ ...novoTemplate, categoria: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md text-sm">
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Conteúdo</label>
            <Textarea value={novoTemplate.conteudo} onChange={(e) => setNovoTemplate({ ...novoTemplate, conteudo: e.target.value })} placeholder="Digite o template... Use {{variavel}} para campos dinâmicos" className="mt-1 h-24" />
            <div className="flex flex-wrap gap-1 mt-2">
              {variaveisDisponiveis.map(v => (
                <button key={v.nome} onClick={() => setNovoTemplate({ ...novoTemplate, conteudo: novoTemplate.conteudo + v.nome })} className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300 transition-colors" title={v.descricao}>
                  {v.nome}
                </button>
              ))}
            </div>
          </div>

          {novoTemplate.conteudo && (
            <div>
              <label className="text-xs font-medium text-slate-600">Preview</label>
              <div className="mt-1 p-3 bg-white border rounded-lg text-sm">{substituirVariaveis(novoTemplate.conteudo)}</div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" data-permission="HubAtendimento.Templates.editar" onClick={onReset}>Cancelar</Button>
            <Button onClick={onSalvar} data-permission="HubAtendimento.Templates.criar" disabled={!novoTemplate.nome || !novoTemplate.conteudo || isPending} className="bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              {editando ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}