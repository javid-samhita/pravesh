/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRAVESH_API_BASE_URL?: string;
  readonly VITE_PRAVESH_CONFIG_URL?: string;
  readonly VITE_PRAVESH_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
