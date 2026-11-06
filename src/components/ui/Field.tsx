import type { ReactNode } from 'react';
import { cx } from './cx';

export interface FieldProps {
  id: string;
  label: ReactNode;
  required?: boolean;
  help?: ReactNode;
  error?: string | null;
  className?: string;
  /** Render label inline after the control (checkbox / toggle). */
  inline?: boolean;
  children: ReactNode;
  aside?: ReactNode;
}

/** Label + control + help/error wrapper. Wires ids for aria-describedby. */
export function Field({ id, label, required, help, error, className, children, aside }: FieldProps) {
  return (
    <div className={cx('min-w-0', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-zinc-800">
          {label}
          {required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] text-red-700">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="mt-1.5 text-[12.5px] text-zinc-500">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export const describedBy = (id: string, error?: string | null, help?: ReactNode) =>
  error ? `${id}-error` : help ? `${id}-help` : undefined;
