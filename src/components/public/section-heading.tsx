export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wider text-or">{eyebrow}</p>
      )}
      <h2 className={`mt-2 font-display text-3xl font-bold lg:text-4xl ${light ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-lg ${light ? "text-slate-300" : "text-slate-500"}`}>{subtitle}</p>
      )}
    </div>
  );
}
