export function TogetherIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Play button / screen */}
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10 9 L10 15 L15 12 Z" fill="currentColor" className={active ? "animate-pulse-subtle" : ""} />
        
        {/* Connection dots */}
        <circle cx="7" cy="20" r="1.5" fill="currentColor" className={active ? "animate-bounce-subtle" : ""} />
        <circle cx="12" cy="20" r="1.5" fill="currentColor" className={active ? "animate-bounce-subtle delay-75" : ""} />
        <circle cx="17" cy="20" r="1.5" fill="currentColor" className={active ? "animate-bounce-subtle delay-150" : ""} />
      </g>
    </svg>
  );
}
