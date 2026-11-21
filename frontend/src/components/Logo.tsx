export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield */}
      <path d="M24 4L6 12V24C6 34 14 42 24 46C34 42 42 34 42 24V12L24 4Z"
        fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth="2"/>
      {/* Radar circles */}
      <circle cx="24" cy="26" r="8" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.6"/>
      <circle cx="24" cy="26" r="4" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.8"/>
      {/* Radar sweep */}
      <line x1="24" y1="26" x2="30" y2="20" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Detection dot */}
      <circle cx="30" cy="20" r="2" fill="#ef4444"/>
      {/* Center dot */}
      <circle cx="24" cy="26" r="1.5" fill="#60a5fa"/>
    </svg>
  );
}
