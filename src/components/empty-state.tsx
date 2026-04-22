import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

type Props = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
};

export default function EmptyState({ icon: Icon = Inbox, title = 'Không có dữ liệu', description }: Props) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={36} strokeWidth={1.5} />
      </div>
      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 13 }}>{description}</div>}
    </div>
  );
}
