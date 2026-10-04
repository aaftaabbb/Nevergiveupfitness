type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

/** Page heading used by every admin screen. Lives in a server-safe file. */
export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl text-text sm:text-5xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
