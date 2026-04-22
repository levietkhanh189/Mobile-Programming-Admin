type Props = { rows?: number; cols?: number };

export default function SkeletonTable({ rows = 6, cols = 5 }: Props) {
  return (
    <div className="table-wrap" style={{ padding: 12 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 14,
            padding: '12px 4px',
            borderBottom: r === rows - 1 ? 'none' : '1px solid var(--border)',
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton" style={{ height: 14, width: c === 0 ? '50%' : '80%' }} />
          ))}
        </div>
      ))}
    </div>
  );
}
