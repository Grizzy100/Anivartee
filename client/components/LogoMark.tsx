export default function LogoMark() {
  return (
    <svg viewBox="0 0 100 100" width="18" height="18">
      {/* Outer circle stroke only */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="white"
        strokeOpacity="0.15"
        strokeWidth="2"
      />

      {/* Constructed A */}
      <path
        d="M30 70 L50 28 L70 70"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Foundation line */}
      <line
        x1="35"
        y1="60"
        x2="65"
        y2="60"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
