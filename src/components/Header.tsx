import { NavSection } from '../types/dhamma';

interface HeaderProps {
  activeSection: NavSection;
  onNavigate: (target: NavSection) => void;
  onOpenStoreModal: () => void;
}

export function Header({ activeSection, onNavigate, onOpenStoreModal }: HeaderProps) {
  const navItems: { id: 'discourses' | 'sayadaws' | 'tips' | 'events' | 'forms'; label: string }[] =
    [
      { id: 'discourses', label: 'Discourses' },
      { id: 'sayadaws', label: 'Sayadaws' },
      { id: 'tips', label: 'Meditation Tips' },
      { id: 'events', label: 'Events' },
      { id: 'forms', label: 'Forms' },
    ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5]/95 dark:bg-[#181512]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-4 py-3.5 sm:px-8">
        <button
          type="button"
          onClick={() => onNavigate('discourses')}
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1917] dark:text-[#F5F5F4] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412]"
        >
          Vipassana Bhavana
        </button>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-[#57534E] dark:text-[#A8A29E]"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412] ${
                  isActive
                    ? 'text-[#1C1917] dark:text-[#F5F5F4] underline decoration-[#9A3412] decoration-1 underline-offset-8'
                    : 'hover:text-[#1C1917] dark:hover:text-[#F5F5F4] hover:underline hover:decoration-[#D6CEBE] hover:underline-offset-8'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenStoreModal}
            className="min-h-[40px] px-4 py-2 text-sm font-medium text-[#FBF9F5] bg-[#9A3412] hover:bg-[#7C2D12] dark:bg-[#B45309] dark:hover:bg-[#92400E] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]"
          >
            Store Teaching
          </button>
        </div>
      </div>

      {/* Compact single-row mobile navigation bar */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center gap-5 overflow-x-auto border-t border-[#E5DFD3]/70 dark:border-[#342E28]/70 px-4 py-2 text-xs font-medium text-[#57534E] dark:text-[#A8A29E]"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[32px] whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'text-[#9A3412] dark:text-[#FDBA74] underline underline-offset-4'
                  : 'hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
