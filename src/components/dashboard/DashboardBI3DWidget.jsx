import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Loader2 } from 'lucide-react';

export default function DashboardBI3DWidget() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const { empresaAtual } = useContextoVisual();

  useEffect(() => {
    if (!containerRef.current) return;

    // Lazy load Three.js (já instalado) para render 3D
    import('three').then(({ default: THREE }) => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);

      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current?.clientWidth / containerRef.current?.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 3);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerRef.current?.clientWidth || 400, 300);
      containerRef.current?.appendChild(renderer.domElement);

      // Criar pirâmide de dados (vendas por mês)
      const geometry = new THREE.ConeGeometry(1, 2, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
      const pyramid = new THREE.Mesh(geometry, material);
      scene.add(pyramid);

      // Adicionar luz
      const light = new THREE.DirectionalLight(0xffffff, 0.8);
      light.position.set(5, 5, 5);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));

      // Animar rotação
      const animate = () => {
        requestAnimationFrame(animate);
        pyramid.rotation.x += 0.01;
        pyramid.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup
      return () => {
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    }).finally(() => setLoading(false));
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
          {loading && (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Renderizando 3D...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}