/**
 * Cliente Base44 local (modo VITE_LOCAL_ONLY) — Agregador
 * Regra-Mãe 3: refatorado em módulos focados sob ./local-base44/ —
 * API pública 100% preservada (localBase44, localApiUser, hydrate, PESSOAS_PARCEIROS_ENTITIES)
 */
export { localApiUser } from './local-base44/topology';
export { PESSOAS_PARCEIROS_ENTITIES } from './local-base44/storage';
export { hydrateLocalBase44FromSnapshot } from './local-base44/snapshot';
export { localBase44 } from './local-base44/index';