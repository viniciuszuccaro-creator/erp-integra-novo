const APP_ENV = 'production';

export const buildRuntimeConfig = Object.freeze({
  appEnv: APP_ENV,
  nodeEnv: APP_ENV,
  base44IgnoreDocs: 'true',
  integrityCheckEnabled: true,
  ignoreDocumentationArtifacts: true,
  blockDocumentationMirrors: true,
  blockChatbotDocumentation: true,
  blockComponentDocumentationGeneration: true,
  autoRunCriticalImprovementTasks: true,
  strictTextDocumentationIgnore: true,
  proofFileName: '.base44-prebuild-integrity-proof.json',
});

export const safeBuildEnv = Object.freeze({
  NODE_ENV: buildRuntimeConfig.nodeEnv,
  APP_ENV: buildRuntimeConfig.appEnv,
  BASE44_IGNORE_DOCS: buildRuntimeConfig.base44IgnoreDocs,
});

export const viteDefineConfig = Object.freeze({
  __BASE44_BUILD_ENV__: JSON.stringify(safeBuildEnv),
  __BASE44_IGNORE_DOCS__: true,
  __APP_RUNTIME_ENV__: JSON.stringify({
    mode: buildRuntimeConfig.appEnv,
    base44IgnoreDocs: true,
    integrityCheckEnabled: true,
  }),
  'import.meta.env.BASE44_IGNORE_DOCS': JSON.stringify(buildRuntimeConfig.base44IgnoreDocs),
  'import.meta.env.APP_ENV': JSON.stringify(buildRuntimeConfig.appEnv),
  'import.meta.env.NODE_ENV': JSON.stringify(buildRuntimeConfig.nodeEnv),
  'process.env': JSON.stringify(safeBuildEnv),
  global: 'globalThis',
});