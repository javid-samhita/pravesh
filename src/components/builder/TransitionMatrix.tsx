import type { Workflow } from '../../config/types';
import { cx } from '../ui';

/** From × To grid of allowed transitions. Each cell is a labelled checkbox. */
export function TransitionMatrix({ workflow, onToggle }: { workflow: Workflow; onToggle: (from: string, to: string) => void }) {
  const { stages } = workflow;
  return (
    <section className="rounded-lg border border-zinc-200 bg-white" aria-labelledby="wf-matrix-h">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h3 id="wf-matrix-h" className="text-[13.5px] font-semibold">
          Transitions matrix
        </h3>
        <p className="text-[12px] text-zinc-500">Rows are the current stage; columns are where it may move next.</p>
      </div>
      <div className="relative overflow-x-auto p-3">
        <table className="border-separate border-spacing-0 text-[12px]">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-white px-2 py-1 text-left font-mono text-[10.5px] font-medium text-zinc-400">
                from \ to
              </th>
              {stages.map((s) => (
                <th key={s.id} scope="col" className="h-24 w-8 px-0 align-bottom font-medium text-zinc-600">
                  <span className="mx-auto block w-4 whitespace-nowrap pb-1 [writing-mode:vertical-rl] rotate-180" title={s.name}>
                    {s.name.length > 16 ? `${s.name.slice(0, 15)}…` : s.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stages.map((from) => (
              <tr key={from.id}>
                <th scope="row" className={cx('sticky left-0 z-10 max-w-[150px] truncate whitespace-nowrap bg-white py-0.5 pr-3 text-left font-medium', from.terminal ? 'text-zinc-400' : 'text-zinc-700')}>
                  {from.name}
                </th>
                {stages.map((to) => {
                  const self = from.id === to.id;
                  const on = from.transitions.includes(to.id);
                  return (
                    <td key={to.id} className="p-0.5 text-center">
                      {self ? (
                        <span className="block h-6 w-6 rounded bg-zinc-100" aria-hidden="true" />
                      ) : (
                        <label className={cx('flex h-6 w-6 cursor-pointer items-center justify-center rounded border transition-colors', on ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-200 hover:border-zinc-400', from.terminal && !on && 'opacity-40')}>
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => onToggle(from.id, to.id)} aria-label={`${from.name} can move to ${to.name}`} />
                          {on && (
                            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                              <path d="M1.5 5.5l2.2 2.2L8.5 2.5" fill="none" stroke="white" strokeWidth="1.6" />
                            </svg>
                          )}
                        </label>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
