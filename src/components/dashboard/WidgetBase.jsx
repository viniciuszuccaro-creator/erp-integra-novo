/**
 * WidgetBase v1.0
 * Componente base reutilizável para todos os widgets do ERP
 * Regra-Mãe: consolidar duplicações, w-full h-full, RBAC
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZE_MAP = {
  sm:   'min-h-[160px]',
  md:   'min-h-[220px]',
  lg:   'min-h-[300px]',
  xl:   'min-h-[400px]',
  full: 'h-full min-h-[160px]',
};

function LoadingState({ rows = 3 }) {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-8 w-full ${i % 2 === 0 ? 'opacity-70' : 'opacity-40'}`} />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
      <AlertTriangle className="w-8 h-8 text-amber-400" />
      <p className="text-sm text-slate-500">{message || 'Erro ao carregar dados'}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="gap-1">
          <RefreshCw className="w-3 h-3" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
      <p className="text-sm text-slate-400">{message || 'Nenhum dado disponível'}</p>
    </div>
  );
}

/**
 * WidgetBase
 * @param {string} title - Título do widget
 * @param {React.ElementType} icon - Ícone (lucide-react)
 * @param {string} iconColor - Classe tailwind para cor do ícone
 * @param {boolean} loading - Estado de carregamento
 * @param {string|null} error - Mensagem de erro
 * @param {function} onRetry - Callback para tentar novamente
 * @param {boolean} empty - Estado vazio
 * @param {string} emptyMessage - Mensagem de estado vazio
 * @param {React.ReactNode} actions - Botões/ações no header
 * @param {React.ReactNode} children - Conteúdo do widget
 * @param {'sm'|'md'|'lg'|'xl'|'full'} size - Altura mínima
 * @param {string} className - Classes extras
 * @param {boolean} noPadding - Remove padding do CardContent
 * @param {string} subtitle - Subtítulo abaixo do título
 * @param {number} loadingRows - Linhas de skeleton
 */
export default function WidgetBase({
  title,
  icon: Icon,
  iconColor = 'text-blue-600',
  loading = false,
  error = null,
  onRetry,
  empty = false,
  emptyMessage,
  actions,
  children,
  size = 'md',
  className,
  noPadding = false,
  subtitle,
  loadingRows = 3,
}) {
  return (
    <Card className={cn('w-full flex flex-col', SIZE_MAP[size], className)}>
      {(title || actions) && (
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {Icon && <Icon className={cn('w-4 h-4 flex-shrink-0', iconColor)} />}
              <div className="min-w-0">
                {title && (
                  <CardTitle className="text-sm font-semibold text-slate-900 truncate">
                    {title}
                  </CardTitle>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn('flex-1 overflow-auto', noPadding ? 'p-0' : 'px-6 pb-6')}>
        {loading ? (
          <LoadingState rows={loadingRows} />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : empty ? (
          <EmptyState message={emptyMessage} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// Sub-exports para uso direto
export { LoadingState, ErrorState, EmptyState };