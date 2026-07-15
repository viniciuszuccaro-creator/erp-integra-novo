import React from 'react';
import QRCode from 'qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

/**
 * Gerador de QR Code para Etiquetas
 * V12.0 - Rastreabilidade completa
 */
export default function QRCodeGenerator({ 
  data, 
  size = 200, 
  showDownload = true,
  label 
}) {
  const [qrDataUrl, setQrDataUrl] = React.useState('');

  React.useEffect(() => {
    if (data) {
      QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [data, size]);

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `qrcode_${label || 'etiqueta'}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (!data) return null;

  return (
    <Card className="inline-block">
      <CardContent className="p-4 text-center">
        {qrDataUrl && (
          <>
            <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-2" />
            {label && (
              <p className="text-xs font-medium text-slate-700 mb-2">{label}</p>
            )}
            {showDownload && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={downloadQR}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar QR Code
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Gerador de etiqueta completa para produção
export function EtiquetaProducaoQR({ op, item }) {
  const dataQR = JSON.stringify({
    op_id: op.id,
    numero_op: op.numero_op,
    item_id: item.id,
    elemento: item.elemento,
    bitola: item.bitola_principal,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="border-2 border-black p-4 bg-white" style={{ width: '10cm', height: '7cm' }}>
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="space-y-2">
          <h3 className="font-bold text-lg border-b pb-1">OP: {op.numero_op}</h3>
          <div className="text-sm space-y-1">
            <p><strong>Elemento:</strong> {item.elemento}</p>
            <p><strong>Posição:</strong> {item.posicao}</p>
            <p><strong>Tipo:</strong> {item.tipo_peca}</p>
            <p><strong>Bitola:</strong> {item.bitola_principal}</p>
            <p><strong>Qtd:</strong> {item.quantidade_pecas} pçs</p>
            <p><strong>Peso:</strong> {item.peso_teorico_total?.toFixed(2)} kg</p>
          </div>
          <div className="text-xs text-slate-600 mt-auto">
            <p>Cliente: {op.cliente_nome}</p>
            <p>Pedido: {op.numero_pedido}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <QRCodeGenerator 
            data={dataQR}
            size={180}
            showDownload={false}
          />
        </div>
      </div>
    </div>
  );
}