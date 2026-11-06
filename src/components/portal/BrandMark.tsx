import type { Identity } from '../../config/types';
import { readableOn } from '../../services/util';

/** Logo from config, or a monogram tile in the brand colour. */
export function BrandMark({ identity, size = 32 }: { identity: Identity; size?: number }) {
  if (identity.logo) {
    return <img src={identity.logo} alt="" width={size} height={size} className="shrink-0 rounded-md object-contain" style={{ width: size, height: size }} />;
  }
  const initials =
    identity.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'P';
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-md font-semibold"
      style={{ width: size, height: size, background: identity.colors.primary, color: readableOn(identity.colors.primary), fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
