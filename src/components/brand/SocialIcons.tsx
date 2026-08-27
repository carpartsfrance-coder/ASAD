/**
 * Icônes de marque (Facebook, Instagram).
 * Lucide ne fournit plus les logos de marque : ces tracés sont donc inline.
 */

interface IconProps {
  size?: number;
  className?: string;
}

export function FacebookIcon({ size = 17, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M14.5 21v-7.8h2.6l.4-3h-3V8.2c0-.87.24-1.46 1.5-1.46h1.6V4.05A21.4 21.4 0 0 0 15.27 4c-2.32 0-3.9 1.42-3.9 4.02v2.24H8.75v3h2.62V21h3.13Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 17, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17.1" cy="6.9" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}
