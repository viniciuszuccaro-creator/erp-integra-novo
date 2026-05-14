import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Loader2 } from 'lucide-react';

export default function DashboardBI3DWidget() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { empresaAtual } = useContextoVisual();

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let cleanup = null;
    const timeout = setTimeout(async () => {
      try {
        const { default: THREE } = await import('three');
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);

        const w = containerRef.current.clientWidth || 400;
        const h = 300;
        const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        camera.position.set(0, 0, 3);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(renderer.domElement);
        }

        const geometry = new THREE.ConeGeometry(1, 2, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
        const pyramid = new THREE.Mesh(geometry, material);
        scene.add(pyramid);

        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        let frameId;
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          pyramid.rotation.x += 0.01;
          pyramid.rotation.y += 0.01;
          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          cancelAnimationFrame(frameId);
          renderer.dispose();
          geometry.dispose();
          material.dispose();
          if (containerRef.current?.contains(renderer.domElement)) {
            renderer.domElement.remove();
          }
        };

        setLoading(false);
      } catch (err) {
        console.warn('Three.js loading failed:', err);
        setError(true);
        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      cleanup?.();
    };
  }, []);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 BI 3D Forecast
        </CardTitle>
        <CardDescription>
          Visualização tridimensional de previsões de vendas e tendências
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full h-80 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center"
        >
          {(loading || error) && (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              {loading && (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Carregando visualização 3D...</span>
                </>
              )}
              {error && (
                <>
                  <span className="text-sm text-amber-600">⚠️ Visualização não disponível</span>
                  <span className="text-xs text-slate-400">Verifique a conexão e recarregue</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}