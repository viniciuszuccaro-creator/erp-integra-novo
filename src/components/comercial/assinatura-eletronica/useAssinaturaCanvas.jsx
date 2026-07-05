import { useState, useRef, useCallback } from "react";

/**
 * Hook que encapsula toda a lógica de canvas para assinatura eletrônica.
 * Responsável por: inicialização, desenho, limpeza e exportação da assinatura.
 */
export function useAssinaturaCanvas() {
  const canvasRef = useRef(null);
  const [desenhando, setDesenhando] = useState(false);
  const [assinaturaVazia, setAssinaturaVazia] = useState(true);

  const inicializarCanvas = useCallback(() => {
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 100);
  }, []);

  const iniciarDesenho = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDesenhando(true);
    setAssinaturaVazia(false);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.type === 'mousedown') {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else if (e.type === 'touchstart') {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const desenhar = useCallback((e) => {
    if (!desenhando) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.type === 'mousemove') {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else if (e.type === 'touchmove') {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [desenhando]);

  const pararDesenho = useCallback(() => {
    setDesenhando(false);
  }, []);

  const limparAssinatura = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setAssinaturaVazia(true);
  }, []);

  const obterAssinaturaBase64 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, []);

  return {
    canvasRef,
    assinaturaVazia,
    inicializarCanvas,
    iniciarDesenho,
    desenhar,
    pararDesenho,
    limparAssinatura,
    obterAssinaturaBase64,
  };
}

export default useAssinaturaCanvas;