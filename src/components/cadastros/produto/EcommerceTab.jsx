import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Aba E-Commerce do formulário de produto
 */
export default function EcommerceTab({ formData, setFormData, modoManual, gerarDescricaoSEO, gerandoDescricaoSEO }) {
  return (
    <>
      <Card className="border-purple-200 bg-white/60 backdrop-blur-md shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-purple-900">🛒 Canais de Venda</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <Label className="text-base font-semibold">Exibir no Site</Label>
                <p className="text-xs text-slate-500">Produto aparecerá no catálogo web</p>
              </div>
              <Switch
                checked={formData.exibir_no_site || false}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, exibir_no_site: v }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <Label className="text-base font-semibold">Sincronizar Marketplace</Label>
                <p className="text-xs text-slate-500">Mercado Livre, Shopee</p>
              </div>
              <Switch
                checked={formData.exibir_no_marketplace || false}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, exibir_no_marketplace: v }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {(formData.exibir_no_site || formData.exibir_no_marketplace) && (
        <Card className="border-green-200 bg-white/60 backdrop-blur-md shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-green-900">📝 Descrição SEO</h3>
              <Button
                type="button" size="sm"
                onClick={gerarDescricaoSEO}
                disabled={gerandoDescricaoSEO || modoManual}
                className="bg-green-600 hover:bg-green-700"
              >
                {gerandoDescricaoSEO ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Gerar com IA
              </Button>
            </div>

            <Textarea
              value={formData.descricao_seo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao_seo: e.target.value }))}
              placeholder="Descrição detalhada para SEO..."
              className="min-h-[100px]"
            />

            <div>
              <Label>URL Amigável (Slug)</Label>
              <Input
                value={formData.slug_site || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  slug_site: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                }))}
                placeholder="vergalhao-8mm-ca50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}