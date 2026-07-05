import './NambacLogo.css';

export default function NambacLogo({ className = '' }) {
  return (
    <svg
      className={`nambac-logo ${className}`.trim()}
      viewBox="0 0 118 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NamBắc"
    >
      <defs>
        <linearGradient id="nambac-mark-fill" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD6EA" />
          <stop offset="0.55" stopColor="#F0E8FF" />
          <stop offset="1" stopColor="#D4F0FF" />
        </linearGradient>
      </defs>

      {/* Mark — pastel pencil tile */}
      <rect
        x="2"
        y="3"
        width="30"
        height="30"
        rx="10"
        fill="url(#nambac-mark-fill)"
        stroke="#B5A3CC"
        strokeWidth="2"
      />
      <path
        d="M10 26V10h4.2l5.4 9.2V10H24v16h-4.1l-5.5-9.4V26H10z"
        fill="#5C3D52"
      />
      <path
        d="M6 8h4.5"
        stroke="#FFB8D9"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="28" cy="8" r="2.2" fill="#A8DDF5" opacity="0.9" />

      {/* Wordmark — single text so Nam + Bắc sit flush (no fixed gap) */}
      <text
        x="42"
        y="25"
        fontFamily="'Patrick Hand', cursive"
        fontSize="19"
        fontWeight="800"
      >
        <tspan fill="#5C4D72">Nam</tspan>
        <tspan fill="#C96A98">Bắc</tspan>
      </text>

      {/* Pencil sparkle */}
      <path
        d="M106 8l1.8 3.6 4 0.6-2.9 2.8 0.7 4-3.6-1.9-3.6 1.9 0.7-4-2.9-2.8 4-0.6z"
        fill="#FFE8A8"
        stroke="#E8C878"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
