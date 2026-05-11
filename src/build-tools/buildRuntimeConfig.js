const APP_ENV = 'production';

export const buildRuntimeConfig = Object.freeze({
  appEnv: APP_ENV,
  ignoreDocumentationArtifacts: true,
  blockDocumentationMirrors: true,
  blockChatbotDocumentation: true,
  autoRunCriticalImprovementTasks: true,
});

export const viteDefineConfig = Object.freeze({
  __BASE44_IGNORE_DOCS__: true,
  __APP_RUNTIME_ENV__: JSON.stringify({
    mode: APP_ENV,
    base44IgnoreDocs: true,
  }),
  'import.meta.env.BASE44_IGNORE_DOCS': JSON.stringify('true'),
  'import.meta.env.APP_ENV': JSON.stringify(APP_ENV),
  global: 'globalThis',
});