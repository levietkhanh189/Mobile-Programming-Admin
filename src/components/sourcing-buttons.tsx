import { SOURCING_PLATFORMS, openSourcing } from '../utils/sourcing';

type Props = {
  query: string;
  size?: number;
  title?: string;
};

export default function SourcingButtons({ query, size = 22, title }: Props) {
  return (
    <div className="sourcing-buttons" title={title}>
      {SOURCING_PLATFORMS.map((p) => (
        <button
          key={p.id}
          className="sourcing-btn"
          onClick={(e) => {
            e.stopPropagation();
            openSourcing(p, query);
          }}
          title={`Tra "${query.slice(0, 40)}" trên ${p.name}`}
          style={{ '--brand': p.color } as React.CSSProperties}
        >
          <img
            src={p.logo}
            alt={p.name}
            style={{ width: size, height: size, objectFit: 'contain' }}
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = 'none';
              (t.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'inline');
            }}
          />
          <span className="sourcing-fallback" style={{ display: 'none' }}>{p.short}</span>
        </button>
      ))}
    </div>
  );
}
