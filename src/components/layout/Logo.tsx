import { Link } from 'react-router-dom';

export const REPO_URL = 'https://github.com/mahammedjavid/pravesh';
export const VERSION = 'v0.4.0';

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 rounded-md text-zinc-900" aria-label="Pravesh home">
      <img src="./pravesh-icon.svg" alt="" width={24} height={24} className="h-6 w-6" />
      <span className="text-[15px] font-semibold tracking-tight">pravesh</span>
    </Link>
  );
}
