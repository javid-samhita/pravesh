import { Section } from './Section';

const STEPS = [
  { n: '01', title: 'Configure', body: 'Walk through nine steps in the browser, or start from one of three example networks.', artefact: '/#/wizard' },
  { n: '02', title: 'Preview', body: 'Submit a test application in a sandboxed copy of the generated portal.', artefact: 'Preview step' },
  { n: '03', title: 'Export', body: 'Download the validated JSON and a .env.example listing every variable your backend needs.', artefact: 'pravesh.config.json' },
  { n: '04', title: 'Deploy', body: 'Drop the file into public/, build, and serve dist/ from any static host.', artefact: 'npm run build' },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" eyebrow="How it works" title="From blank repository to live portal in an afternoon">
      <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-0">
        <span className="absolute left-0 right-0 top-[15px] hidden h-px bg-zinc-200 md:block" aria-hidden="true" />
        {STEPS.map((s) => (
          <li key={s.n} className="relative md:pr-8">
            <span className="relative z-10 inline-flex h-[30px] items-center rounded-md border border-zinc-300 bg-white px-2 font-mono text-[12px] font-medium text-zinc-900">{s.n}</span>
            <h3 className="mt-4 text-[15px] font-semibold text-zinc-900">{s.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-6 text-zinc-600">{s.body}</p>
            <code className="mt-3 inline-block rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11.5px] text-zinc-700">{s.artefact}</code>
          </li>
        ))}
      </ol>
    </Section>
  );
}
