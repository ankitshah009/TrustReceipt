type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  id,
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl";

  return (
    <header id={id} className={alignClass}>
      <p className="tr-section-label">{eyebrow}</p>
      <h2 className="tr-headline mt-2 text-2xl sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-[17px]">{description}</p>
      ) : null}
    </header>
  );
}
