export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-medium text-dark">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
