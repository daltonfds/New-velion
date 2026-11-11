import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-60 flex-col items-start justify-center rounded-xl border border-dashed border-ink-300 bg-white p-8 sm:px-10">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Inbox aria-hidden className="h-5 w-5" strokeWidth={1.75} />
      </div>

      <h3 className="text-base font-semibold text-ink-900">{title}</h3>

      {description && <p className="mt-1.5 max-w-md text-sm leading-6 text-ink-500">{description}</p>}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
