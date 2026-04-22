interface LogoProps {
  size?: number;
  id?: string;
}

export default function Logo({ size = 32, id = "logo" }: LogoProps) {
  const asphaltId = `${id}-asphalt`;
  const shadowId = `${id}-shadow`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={asphaltId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a3a44" />
          <stop offset="100%" stopColor="#1c1c22" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <path
        d="M32 108 L82 160 L172 48"
        stroke={`url(#${asphaltId})`}
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${shadowId})`}
      />
      <path
        d="M32 108 L82 160 L172 48"
        stroke="#e2a820"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="11 13"
      />
    </svg>
  );
}
