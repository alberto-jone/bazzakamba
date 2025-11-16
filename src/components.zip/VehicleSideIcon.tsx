import React from 'react';

interface VehicleSideIconProps {
  category: string; // 'moto' | 'economy' | 'standard' | 'luxury'
  color: string;
  className?: string;
}

export const VehicleSideIcon: React.FC<VehicleSideIconProps> = ({ category, color, className = "" }) => {
  
  // Helper for realistic wheels
  const RealisticWheel = ({ cx, cy, r = 10 }: { cx: number, cy: number, r?: number }) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1F2937" />
      <circle cx={cx} cy={cy} r={r * 0.65} fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
      <circle cx={cx} cy={cy} r={r * 0.15} fill="#374151" />
      <path d={`M ${cx-r*0.4} ${cy} L ${cx+r*0.4} ${cy}`} stroke="#9CA3AF" strokeWidth="1" />
      <path d={`M ${cx} ${cy-r*0.4} L ${cx} ${cy+r*0.4}`} stroke="#9CA3AF" strokeWidth="1" />
    </g>
  );

  const Shadow = () => (
    <ellipse cx="60" cy="54" rx="50" ry="4" fill="black" opacity="0.2" filter="blur(2px)" />
  );

  if (category === 'moto') {
    return (
      <svg viewBox="0 0 120 60" className={className}>
        <Shadow />
        <RealisticWheel cx={30} cy={42} r={11} />
        <RealisticWheel cx={90} cy={42} r={11} />
        <path d="M 45 42 L 60 42 L 62 28 L 48 28 Z" fill="#374151" />
        <circle cx={54} cy={36} r={5} fill="#4B5563" />
        <path d="M 40 25 L 75 22 L 82 30 L 65 40 L 42 40 Z" fill={color} />
        <path d="M 38 25 Q 45 22 55 22 L 70 22 L 68 26 L 40 26 Z" fill="#111827" />
        <path d="M 90 42 L 78 18" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 78 18 L 72 12" stroke="#111827" strokeWidth="2" />
        <path d="M 78 18 L 85 18" stroke="#111827" strokeWidth="2" />
        <path d="M 82 26 L 86 26 L 86 20 Z" fill="#FCD34D" />
        <path d="M 50 38 L 80 36" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === 'economy') {
    return (
      <svg viewBox="0 0 120 60" className={className}>
        <Shadow />
        <path d="M 112 38 Q 112 42 108 42 L 106 42 A 12 12 0 0 1 82 42 L 38 42 A 12 12 0 0 1 14 42 L 8 42 Q 5 42 5 35 L 5 28 Q 10 18 30 14 L 65 12 Q 100 12 108 25 L 112 38 Z" fill={color} />
        <path d="M 35 17 L 66 17 L 66 28 L 30 28 Q 31 22 35 17 Z" fill="#1F2937" />
        <path d="M 70 17 L 92 19 L 98 28 L 70 28 Z" fill="#1F2937" />
        <rect x="62" y="30" width="8" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5"/>
        <path d="M 6 32 L 10 30 L 10 34 L 6 33 Z" fill="#FCD34D" />
        <path d="M 112 28 L 108 32 L 108 36 L 112 34 Z" fill="#EF4444" />
        <RealisticWheel cx={26} cy={42} r={10} />
        <RealisticWheel cx={94} cy={42} r={10} />
      </svg>
    );
  }

  if (category === 'standard') {
    return (
      <svg viewBox="0 0 120 60" className={className}>
        <Shadow />
        <path d="M 118 38 Q 118 42 112 42 L 108 42 A 12 12 0 0 1 84 42 L 41 42 A 12 12 0 0 1 17 42 L 8 42 Q 5 42 5 32 Q 5 22 15 22 L 35 18 L 50 13 L 85 13 L 100 21 L 115 23 Q 118 23 118 38 Z" fill={color} />
        <path d="M 38 19 L 62 17 L 62 27 L 32 27 L 38 19 Z" fill="#111827" />
        <path d="M 66 17 L 84 17 L 92 27 L 66 27 Z" fill="#111827" />
        <rect x="68" y="30" width="8" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5"/>
        <rect x="42" y="30" width="8" height="1.5" fill="rgba(0,0,0,0.3)" rx="0.5"/>
        <path d="M 5 31 L 12 30 L 10 34 Z" fill="#FCD34D" />
        <path d="M 118 31 L 112 30 L 114 34 Z" fill="#EF4444" />
        <RealisticWheel cx={29} cy={42} r={10} />
        <RealisticWheel cx={96} cy={42} r={10} />
      </svg>
    );
  }

  if (category === 'luxury') {
    return (
      <svg viewBox="0 0 120 60" className={className}>
        <Shadow />
        <path d="M 114 38 Q 114 42 110 42 L 106 42 A 13 13 0 0 1 80 42 L 45 42 A 13 13 0 0 1 19 42 L 12 42 Q 5 42 5 35 L 5 26 Q 10 16 30 14 L 95 14 Q 110 14 114 24 L 114 38 Z" fill={color} />
        <rect x="35" y="12" width="60" height="2" rx="1" fill="#374151" />
        <path d="M 34 18 L 64 18 L 64 29 L 30 29 Z" fill="#111827" />
        <path d="M 68 18 L 98 18 L 100 29 L 68 29 Z" fill="#111827" />
        <rect x="5" y="36" width="109" height="2" fill="#1F2937" opacity="0.2" />
        <rect x="72" y="31" width="8" height="2" fill="#F3F4F6" />
        <rect x="42" y="31" width="8" height="2" fill="#F3F4F6" />
        <rect x="5" y="30" width="4" height="4" fill="#FCD34D" />
        <rect x="111" y="28" width="3" height="6" fill="#EF4444" />
        <RealisticWheel cx={32} cy={42} r={11} />
        <RealisticWheel cx={93} cy={42} r={11} />
      </svg>
    );
  }

  return null;
};