/**
 * useModuleEventBus — Hook frontend para pub/sub entre módulos
 * Publica eventos e faz polling de eventos recebidos em tempo real.
 * Multiempresa: injeta group_id e empresa_id automaticamente.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const POLL_INTERVAL_MS = 8000; // 8 segundos

export default function useModuleEventBus({ moduleTarget, enabled = true } = {}) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [events, setEvents]     = useState([]);
  const [publishing, setPub]    = useState(false);
  const [error, setError]       = useState(null);
  const sinceRef = useRef(new Date(Date.now() - 60000).toISOString());
  const timerRef = useRef(null);

  const poll = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await base44.functions.invoke("moduleEventBus", {
        action: "poll",
        module_target: moduleTarget || undefined,
        since_ts: sinceRef.current,
        group_id:   grupoAtual?.id   || undefined,
        empresa_id: empresaAtual?.id || undefined,
        limit: 30,
      });
      const newEvents = res?.data?.events || [];
      if (newEvents.length > 0) {
        sinceRef.current = new Date().toISOString();
        setEvents(prev => {
          const ids = new Set(prev.map(e => e.id));
          const added = newEvents.filter(e => !ids.has(e.id));
          return added.length > 0 ? [...added, ...prev].slice(0, 100) : prev;
        });
      }
    } catch (e) {
      setError(e?.message || "Erro no poll");
    }
  }, [moduleTarget, enabled, grupoAtual?.id, empresaAtual?.id]);

  useEffect(() => {
    if (!enabled) return;
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [poll, enabled]);

  const publish = useCallback(async ({ eventType, moduleSource, payload = {}, targetModule }) => {
    setPub(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("moduleEventBus", {
        action: "publish",
        event_type: eventType,
        module_source: moduleSource,
        module_target: targetModule || undefined,
        payload,
        group_id:   grupoAtual?.id   || undefined,
        empresa_id: empresaAtual?.id || undefined,
      });
      if (res?.data?.ok) {
        setEvents(prev => [res.data.event, ...prev].slice(0, 100));
      }
      return res?.data;
    } catch (e) {
      setError(e?.message || "Erro ao publicar evento");
    } finally {
      setPub(false);
    }
  }, [grupoAtual?.id, empresaAtual?.id]);

  const markProcessed = useCallback(async (eventId) => {
    try {
      await base44.functions.invoke("moduleEventBus", { action: "mark_processed", event_id: eventId });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, processed: true } : e));
    } catch (_) {}
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, publishing, error, publish, markProcessed, clearEvents, refetch: poll };
}