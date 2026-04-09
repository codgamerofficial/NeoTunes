/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER?: 'mock' | 'server'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
