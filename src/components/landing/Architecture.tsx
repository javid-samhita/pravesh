import { Link } from 'react-router-dom';
import { Section } from './Section';

interface BoxProps {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub: string;
  accent?: boolean;
  dark?: boolean;
}

function Box({ x, y, w = 172, h = 62, title, sub, accent, dark }: BoxProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={dark ? '#0A0A0A' : '#FFFFFF'} stroke={accent ? '#0F766E' : dark ? '#0A0A0A' : '#D4D4D8'} strokeWidth="1" />
      {accent && <rect x={x} y={y + 10} width="2" height={h - 20} fill="#2DD4BF" />}
      <text x={x + 14} y={y + 26} fontSize="13" fontWeight="600" fill={dark ? '#FAFAFA' : '#18181B'} fontFamily="Geist, ui-sans-serif, system-ui">
        {title}
      </text>
      <text x={x + 14} y={y + 45} fontSize="11" fill={dark ? '#A1A1AA' : '#71717A'} fontFamily="'Geist Mono', ui-monospace, monospace">
        {sub}
      </text>
    </g>
  );
}

function Arrow({ d, label, lx, ly }: { d: string; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#A1A1AA" strokeWidth="1.25" markerEnd="url(#arrow)" />
      {label && (
        <text x={lx} y={ly} fontSize="10.5" fill="#71717A" fontFamily="'Geist Mono', ui-monospace, monospace" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function Architecture() {
  return (
    <Section
      id="architecture"
      eyebrow="Technical architecture"
      title="A static frontend with clear seams for your backend"
      intro={
        <>
          The configurator and the portal share one model and one validator. Anything that needs a credential sits on the server side of the boundary. Details in{' '}
          <Link to="/docs/architecture" className="text-teal-700 underline underline-offset-2">
            ARCHITECTURE.md
          </Link>
          .
        </>
      }
    >
      <div className="relative overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50/60 p-4">
        <svg viewBox="0 0 1000 400" className="block w-full min-w-[760px]" role="img" aria-labelledby="arch-title arch-desc">
          <title id="arch-title">Pravesh architecture</title>
          <desc id="arch-desc">
            The configurator exports pravesh.config.json, which the portal runtime loads. The portal writes applications through an ApplicationStore adapter to your backend API, which signs
            webhooks and calls integrations using server-side secrets.
          </desc>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="#A1A1AA" />
            </marker>
          </defs>

          {/* Boundaries */}
          <rect x="10" y="14" width="620" height="372" rx="8" fill="none" stroke="#D4D4D8" strokeDasharray="4 4" />
          <text x="26" y="36" fontSize="11" fill="#71717A" fontFamily="'Geist Mono', ui-monospace, monospace">
            BROWSER · static bundle (dist/)
          </text>
          <rect x="650" y="14" width="340" height="372" rx="8" fill="#FFFFFF" stroke="#D4D4D8" strokeDasharray="4 4" />
          <text x="666" y="36" fontSize="11" fill="#71717A" fontFamily="'Geist Mono', ui-monospace, monospace">
            SERVER · you operate
          </text>

          {/* Browser */}
          <Box x={30} y={60} w={160} title="Configurator" sub="/#/wizard · 9 steps" />
          <Box x={230} y={60} title="pravesh.config.json" sub="schema 1.0 · validated" accent />
          <Box x={450} y={60} w={160} title="Portal runtime" sub="/#/portal · /admin" dark />
          <Box x={30} y={200} w={160} title="localStorage" sub="autosave · drafts" />
          <Box x={230} y={300} title="Applicants, reviewers" sub="apply · track · review" />
          <Box x={450} y={200} w={160} title="ApplicationStore" sub="adapter interface" />

          <Arrow d="M190 91 H226" label="export" lx={208} ly={82} />
          <Arrow d="M402 91 H446" />
          <text x="426" y="152" fontSize="10.5" fill="#71717A" fontFamily="'Geist Mono', ui-monospace, monospace" textAnchor="middle">
            VITE_PRAVESH_CONFIG_URL
          </text>
          <Arrow d="M110 122 V196" label="autosave" lx={144} ly={163} />
          <Arrow d="M530 122 V196" />
          <Arrow d="M402 331 H490 V266" />

          {/* Server */}
          <Box x={680} y={200} w={282} title="Your onboarding API" sub="technical.apiBaseUrl" dark />
          <Box x={680} y={60} w={282} title="Webhooks" sub="HMAC · X-Pravesh-Signature" />
          <Box x={680} y={310} w={136} h={56} title="Integrations" sub="GST · bank · KYC" />
          <Box x={826} y={310} w={136} h={56} title="Secret store" sub="PRAVESH_*" accent />

          <Arrow d="M610 231 H676" label="HTTPS" lx={643} ly={222} />
          <Arrow d="M821 200 V126" label="signed events" lx={870} ly={166} />
          <Arrow d="M748 262 V306" />
          <Arrow d="M894 306 V262" />
        </svg>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 text-[13.5px] text-zinc-600 md:grid-cols-3">
        <p>
          <span className="font-medium text-zinc-900">Runs anywhere.</span> React 18, TypeScript and Vite. Hash routing and a relative base mean <code className="font-mono text-[12.5px]">dist/</code> needs
          no rewrites.
        </p>
        <p>
          <span className="font-medium text-zinc-900">Replaceable adapters.</span> Swap the localStorage <code className="font-mono text-[12.5px]">ApplicationStore</code> for your API client without
          touching the UI.
        </p>
        <p>
          <span className="font-medium text-zinc-900">Three dependencies.</span> React, React Router and lucide-react. No UI kit, state library or drag-and-drop package.
        </p>
      </div>
    </Section>
  );
}
