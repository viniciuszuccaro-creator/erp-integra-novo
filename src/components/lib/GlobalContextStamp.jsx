/**
 * GlobalContextStamp — desativado.
 * O stamping de contexto multiempresa é feito pelo LayoutRBACWrapper,
 * evitando duplo wrap que corrompia o DOM durante HMR.
 */
export default function GlobalContextStamp() {
  return null;
}