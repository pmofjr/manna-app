export default function WheatIcon({ size = 32, animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      style={animated ? { animation: 'sway 2s ease-in-out infinite' } : {}}
    >
      <line x1="20" y1="38" x2="20" y2="8" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="20" cy="7" rx="3.5" ry="5.5" fill="#C9A84C" opacity="0.9"/>
      <ellipse cx="14.5" cy="13" rx="3" ry="5" fill="#C9A84C" opacity="0.75" transform="rotate(-28 14.5 13)"/>
      <ellipse cx="12" cy="21" rx="2.8" ry="4.5" fill="#C9A84C" opacity="0.6" transform="rotate(-22 12 21)"/>
      <ellipse cx="25.5" cy="13" rx="3" ry="5" fill="#C9A84C" opacity="0.75" transform="rotate(28 25.5 13)"/>
      <ellipse cx="28" cy="21" rx="2.8" ry="4.5" fill="#C9A84C" opacity="0.6" transform="rotate(22 28 21)"/>
      <path d="M20 28 Q13 24 11 17" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M20 28 Q27 24 29 17" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}
