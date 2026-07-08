import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * GLOBAL NETWORK ERROR HANDLER V22.0
 * Intercepta erros de rede não tratados e exibe mensagens amigáveis
 */
export default function GlobalNetworkErrorHandler() {
  useEffect(() => {
    let errorCount = 0;
    let lastErrorTime = 0;
    const ERROR_THRESHOLD = 3;
    const TIME_WINDOW = 5000; // 5 segundos

    const handleError = (event) => {
      const now = Date.now();
      
      // Reset counter se passou tempo suficiente
      if (now - lastErrorTime > TIME_WINDOW) {
        errorCount = 0;
      }
      
      const errorMsg = event?.error?.message || event?.message || '';
      // Ignore benign abort/cancel errors
      const errorCode = event?.error?.code;
      const errorName = event?.error?.name;
      if (errorName === 'AbortError' || errorCode === 'ERR_CANCELED' || /aborted|abort|canceled|cancelled/i.test(String(errorMsg))) {
        return;
      }
      const isNetworkError = errorMsg.includes('Network Error') || 
                            errorMsg.includes('Failed to fetch') ||
                            errorMsg.includes('timeout');
      
      if (isNetworkError) {
        errorCount++;
        lastErrorTime = now;
        
        if (errorCount >= ERROR_THRESHOLD) {
          toast.error('⚠️ Problemas de conexão detectados', {
            description: 'Verifique sua internet. Tentando reconectar automaticamente...',
            duration: 5000
          });
          errorCount = 0; // Reset para não spammar
        }
      }
    };

    const handleUnhandledRejection = (event) => {
      const reason = event?.reason;
      const msg = String(reason?.message || '');
      const code = reason?.code;
      const name = reason?.name;
      if (name === 'AbortError' || code === 'ERR_CANCELED' || /aborted|abort|canceled|cancelled/i.test(msg)) {
        return;
      }
      const isNetworkError = msg.includes('Network Error') ||
                             msg.includes('Failed to fetch') ||
                             code === 'ECONNABORTED';
      // 500 do backend: suprime para não virar erro não-tratado visível
      const isServerError = msg.includes('status code 500') || msg.includes('status code 429') ||
                            msg.includes('status code 502') || msg.includes('status code 503');

      if (isNetworkError || isServerError) {
        event.preventDefault(); // Previne console spam
        handleError({ message: reason?.message });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}