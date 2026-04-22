import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  count?: number;
  actions?: ReactNode;
};

export default function PageHeader({ title, subtitle, count, actions }: Props) {
  return (
    <div className="page-header">
      <div>
        <h2>
          {title}
          {count != null && <span className="count-pill">{count}</span>}
        </h2>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
