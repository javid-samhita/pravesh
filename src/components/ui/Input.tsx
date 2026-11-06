import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cx } from './cx';

export const controlClass = (invalid?: boolean, extra?: string) =>
  cx(
    'block w-full rounded-md border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors',
    'focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-teal-600/20',
    'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500',
    invalid ? 'border-red-400 focus:border-red-500' : 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600',
    extra,
  );

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; mono?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, mono, className, ...rest }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={controlClass(invalid, cx('h-9', mono && 'font-mono text-[13px]', className))} {...rest} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, className, rows = 3, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} aria-invalid={invalid || undefined} className={controlClass(invalid, cx('py-2 leading-5', className))} {...rest} />;
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid, className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={controlClass(
        invalid,
        cx(
          'h-9 appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8',
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
          className,
        ),
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
