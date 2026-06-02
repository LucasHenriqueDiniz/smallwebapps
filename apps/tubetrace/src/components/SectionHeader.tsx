interface SectionHeaderProps {
  label: string;        // eyebrow text (small caps)
  title: string;        // main heading
  description?: string; // optional subtitle
}

export function SectionHeader({ label, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-1.5">{label}</p>
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xl">{description}</p>
      )}
    </div>
  );
}
