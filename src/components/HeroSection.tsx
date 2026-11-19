import { ArrowRight } from 'lucide-react';
import { HERO_LIBRARY_IMAGE } from '../data/dhammaSeed';
import { ArchivalImage } from './ArchivalImage';

interface HeroSectionProps {
  totalDiscourses: number;
  totalTips: number;
  totalEvents: number;
  onEnterReadingRoom: () => void;
  onExploreEvents: () => void;
  onOpenGitHubStudio: () => void;
}

export function HeroSection({
  totalDiscourses,
  totalTips,
  totalEvents,
  onEnterReadingRoom,
  onExploreEvents,
  onOpenGitHubStudio,
}: HeroSectionProps) {
  return (
    <section className="border-b border-[#E5DFD3] dark:border-[#342E28]">
      <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-10 sm:px-8 sm:pt-14 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E] font-mono-code">
                Dhamma Page
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold leading-[1.12] tracking-tight text-[#1C1917] dark:text-[#F5F5F4] text-balance">
                Sayadaw Teachings, Meditation Practice &amp; Group Courses
              </h1>

              <p className="text-base sm:text-[1.0625rem] leading-[1.7] text-[#44403C] dark:text-[#D6D3D1] max-w-xl">
                The living Dhamma repository for our Vipassana Bhavana group. Store and read
                discourses from our Sayadaw teachers, explore practical meditation tips, follow
                upcoming retreat courses, and submit registrations online.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onEnterReadingRoom}
                className="inline-flex items-center gap-2.5 min-h-[44px] px-6 py-2.5 text-sm font-medium text-[#FBF9F5] bg-[#1C1917] hover:bg-[#292524] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#E7E5E4] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
              >
                <span>Open Reading Room</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreEvents}
                className="inline-flex items-center min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#1C1917] dark:text-[#E7E5E4] border border-[#D6CEBE] dark:border-[#44403C] hover:border-[#9A3412] dark:hover:border-[#D97757] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
              >
                Upcoming Courses &amp; Events
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <ArchivalImage
              src={HERO_LIBRARY_IMAGE}
              alt="Monastic library desk with palm-leaf manuscripts and bound Pāli volumes in warm morning light"
              caption="Fig. 1 — Palm-leaf manuscripts and bound Tipiṭaka study volumes in morning light."
              aspectClassName="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[260px]"
              className="h-full"
            />
          </div>
        </div>

        {/* Full-width 4-column summary strip */}
        <div className="mt-10 pt-8 border-t border-[#E5DFD3] dark:border-[#342E28] grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <dt className="text-xs tracking-wider uppercase text-[#78716C] dark:text-[#A8A29E]">
              Sayadaw Discourses
            </dt>
            <dd className="mt-1 font-display text-3xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] tabular-nums">
              {totalDiscourses}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wider uppercase text-[#78716C] dark:text-[#A8A29E]">
              Meditation Tips
            </dt>
            <dd className="mt-1 font-display text-3xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] tabular-nums">
              {totalTips}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wider uppercase text-[#78716C] dark:text-[#A8A29E]">
              Scheduled Courses
            </dt>
            <dd className="mt-1 font-display text-3xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] tabular-nums">
              {totalEvents}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wider uppercase text-[#78716C] dark:text-[#A8A29E]">
              GitHub Pages Publishing
            </dt>
            <dd className="mt-1.5">
              <button
                type="button"
                onClick={onOpenGitHubStudio}
                className="font-mono-code text-sm text-[#9A3412] dark:text-[#FDBA74] hover:underline underline-offset-4 cursor-pointer text-left break-all"
              >
                theartofnoting.github.io/dhamma_content
              </button>
            </dd>
          </div>
        </div>
      </div>
    </section>
  );
}
