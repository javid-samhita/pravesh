import { CodeBlock } from '../ui';
import { Section } from './Section';

const CMDS = `# clone the starter
npx degit mahammedjavid/pravesh my-portal
cd my-portal
# install and run the configurator
npm install
npm run dev
# production build, then verify it locally
npm run build
npm run preview`;

export function QuickStart() {
  return (
    <Section id="quick-start" eyebrow="Quick start" title="Four commands to a running configurator">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <CodeBlock code={CMDS} title="terminal" shell />
        <dl className="space-y-4 text-[13.5px]">
          <div>
            <dt className="font-medium text-zinc-900">Requirements</dt>
            <dd className="mt-0.5 text-zinc-600">Node.js 18.18+ and npm 9+. Nothing else.</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">Ports</dt>
            <dd className="mt-0.5 font-mono text-[12.5px] text-zinc-600">dev :5173 · preview :4173</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">Output</dt>
            <dd className="mt-0.5 text-zinc-600">
              A static <code className="font-mono text-[12.5px]">dist/</code> folder. Deploy to Pages, Netlify, Vercel, S3 or Nginx.
            </dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
