export type PortalView =
  | { name: 'apply' }
  | { name: 'applications' }
  | { name: 'application'; id: string }
  | { name: 'admin'; id?: string };
