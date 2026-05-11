const appEnv = 'production';

export const viteRuntimeDefine = Object.freeze({
  __BASE44_IGNORE_DOCS__: true,
  __APP_RUNTIME_ENV__: JSON.stringify({
    mode: appEnv,
    base44IgnoreDocs: true,
  }),
  'import.meta.env.BASE44_IGNORE_DOCS': JSON.stringify('true'),
  'import.meta.env.APP_ENV': JSON.stringify(appEnv),
  global: 'globalThis',
});