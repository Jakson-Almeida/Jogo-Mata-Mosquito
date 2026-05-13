type Props = {
  size: 52 | 72 | 92
  flipped: boolean
  className?: string
}

export function MosquitoSprite({ size, flipped, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Mosquito"
      style={{
        transform: flipped ? 'scaleX(-1)' : undefined,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))',
      }}
    >
      <defs>
        <linearGradient id="mosqBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <ellipse cx="34" cy="36" rx="18" ry="12" fill="url(#mosqBody)" />
      <ellipse cx="44" cy="30" rx="10" ry="8" fill="#64748b" />
      <path
        d="M12 28 Q6 20 4 12 M14 34 Q4 34 2 44 M14 40 Q6 48 8 56"
        stroke="#334155"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M52 28 Q58 20 60 12 M50 34 Q60 34 62 44 M50 40 Q58 48 56 56"
        stroke="#334155"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M38 24 L48 18 L52 22 Z" fill="#1e293b" opacity="0.85" />
      <circle cx="46" cy="26" r="2.2" fill="#0ea5e9" />
    </svg>
  )
}
