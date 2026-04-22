import { initials } from '../utils/format';

type Props = { name?: string; size?: number };

const PALETTE = [
  ['#6366f1', '#8b5cf6'],
  ['#10b981', '#14b8a6'],
  ['#f59e0b', '#ef4444'],
  ['#3b82f6', '#6366f1'],
  ['#ec4899', '#f43f5e'],
  ['#0ea5e9', '#06b6d4'],
];

const pickColor = (name: string): string => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % PALETTE.length;
  const [a, b] = PALETTE[h];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
};

export default function Avatar({ name = '', size = 34 }: Props) {
  const bg = pickColor(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}
