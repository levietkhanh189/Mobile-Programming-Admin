import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Props = {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: 'brand' | 'success' | 'warning' | 'info';
  trend?: { value: number; label?: string };
};

export default function StatCard({ label, value, sub, icon: Icon, accent = 'brand', trend }: Props) {
  return (
    <div className={`card stat-card stat-accent-${accent}`}>
      <div className="stat-head">
        <span className="label">{label}</span>
        <div className="icon-wrap">
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>
      <div className="value">{value}</div>
      {(sub || trend) && (
        <div className="sub">
          {trend && (
            <span className={trend.value >= 0 ? 'trend-up' : 'trend-down'}>
              {trend.value >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          )}
          {sub}
        </div>
      )}
    </div>
  );
}
