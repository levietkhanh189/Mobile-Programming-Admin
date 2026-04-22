type Props = {
  status: string;
  withDot?: boolean;
};

export default function StatusBadge({ status, withDot = true }: Props) {
  const key = status.toLowerCase();
  return (
    <span className={`badge badge-${key}`}>
      {withDot && <span className="dot" />}
      {status}
    </span>
  );
}
