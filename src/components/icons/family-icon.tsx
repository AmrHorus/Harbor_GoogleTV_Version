export function FamilyIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Parent figure */}
        <circle cx="8" cy="7" r="2.5" className={active ? "animate-pulse-subtle" : ""} />
        <path d="M5 20 L5 13 Q5 10 8 10 Q11 10 11 13 L11 20" />
        
        {/* Child figure */}
        <circle cx="16" cy="9" r="2" className={active ? "animate-pulse-subtle" : ""} />
        <path d="M14 20 L14 14 Q14 12 16 12 Q18 12 18 14 L18 20" />
        
        {/* Connection arc */}
        <path 
          d="M10 15 Q12 13 14 15" 
          strokeDasharray="4 2"
          className={active ? "animate-dash-flow" : ""}
        />
      </g>
    </svg>
  );
}
