import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { cx } from './cx';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  tone: Tone;
  title: string;
  body?: string;
}

interface ToastApi {
  notify: (title: string, opts?: { tone?: Tone; body?: string }) => void;
}

const ToastContext = createContext<ToastApi>({ notify: () => undefined });

export function useToast() {
  return useContext(ToastContext);
}

const ICON = { success: Check, error: AlertTriangle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const notify = useCallback<ToastApi['notify']>(
    (title, opts) => {
      seq.current += 1;
      const id = seq.current;
      setItems((list) => [...list.slice(-3), { id, title, tone: opts?.tone ?? 'success', body: opts?.body }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );
  const api = useMemo(() => ({ notify }), [notify]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2">
        {items.map((t) => {
          const Icon = ICON[t.tone];
          return (
            <div key={t.id} className="pointer-events-auto flex items-start gap-2.5 rounded-md border border-zinc-200 bg-white px-3 py-2.5 shadow-pop">
              <Icon size={16} className={cx('mt-0.5 shrink-0', t.tone === 'success' && 'text-teal-700', t.tone === 'error' && 'text-red-600', t.tone === 'info' && 'text-zinc-500')} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-zinc-900">{t.title}</p>
                {t.body && <p className="text-[12.5px] text-zinc-500">{t.body}</p>}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="rounded p-0.5 text-zinc-400 hover:text-zinc-700">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
