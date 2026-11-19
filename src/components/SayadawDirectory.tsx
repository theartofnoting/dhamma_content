import { DhammaDiscourse, SayadawProfile } from '../types/dhamma';

interface SayadawDirectoryProps {
  sayadaws: SayadawProfile[];
  discourses: DhammaDiscourse[];
  onFilterBySayadaw: (sayadawId: string) => void;
}

export function SayadawDirectory({
  sayadaws,
  discourses,
  onFilterBySayadaw,
}: SayadawDirectoryProps) {
  return (
    <section
      id="sayadaws-section"
      className="border-t border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16]"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-16">
        <div className="max-w-2xl space-y-2 pb-10 border-b border-[#E5DFD3] dark:border-[#342E28]">
          <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
            02. Lineage &amp; Teachers
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
            Sayadaw Masters in the Archive
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
            Biographical notes, monastic seats, and core Pāli-Burmese lineages preserved by our
            Vipassana Bhavana group.
          </p>
        </div>

        <div className="divide-y divide-[#E5DFD3] dark:divide-[#342E28]">
          {sayadaws.map((s) => {
            const count = discourses.filter((d) => d.sayadawId === s.id).length;
            return (
              <article
                key={s.id}
                className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-4 space-y-1.5">
                  <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                    {s.years} · {s.location}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                    {s.name}
                  </h3>
                  {s.chineseName && (
                    <p className="text-sm text-[#57534E] dark:text-[#D6D3D1]">{s.chineseName}</p>
                  )}
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] pt-1">
                    {s.honorificTitle}
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                    {s.monastery} · {s.lineage}
                  </p>
                  <p className="text-sm leading-[1.7] text-[#44403C] dark:text-[#D6D3D1]">
                    {s.biography}
                  </p>
                </div>

                <div className="lg:col-span-3 flex flex-col justify-between gap-4 lg:items-end">
                  <div className="lg:text-right space-y-1">
                    <p className="text-xs uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                      Key Works
                    </p>
                    <ul className="text-xs text-[#44403C] dark:text-[#D6D3D1] space-y-1">
                      {s.primaryTexts.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap lg:justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onFilterBySayadaw(s.id)}
                      className="min-h-[40px] px-4 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] hover:text-[#9A3412] dark:hover:border-[#FDBA74] dark:hover:text-[#FDBA74] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span className="tabular-nums">View {count} Discourses</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
