import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit2, Trash2, MessageSquare, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onCopiar, onEditar, onExcluir, onSelecionarTemplate }) {
  return (
    <motion.div key={template.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="h-full hover:shadow-lg transition-shadow group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm">{template.nome}</CardTitle>
              <Badge className="mt-1 text-xs">{template.categoria}</Badge>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopiar(template.conteudo)}>
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditar(template)}>
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={onExcluir}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-600 line-clamp-3 mb-3">{template.conteudo}</p>
          {template.variaveis?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.variaveis.slice(0, 3).map((v, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <Tag className="w-2 h-2 mr-1" />{v}
                </Badge>
              ))}
            </div>
          )}
          {onSelecionarTemplate && (
            <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => onSelecionarTemplate(template.conteudo)}>
              <MessageSquare className="w-3 h-3 mr-1" />Usar Template
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}