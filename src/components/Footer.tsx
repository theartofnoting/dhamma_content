import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { NavSection } from '../types/dhamma';

interface FooterProps {
  onNavigate: (target: NavSection) => void;
  onResetArchive: () => void;
}

export function Footer({ onNavigate, onResetArchive }: FooterProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <footer className="border-t border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/50 dark:bg-[#161310]">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <p className="font-display text-xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
            Vipassana Bhavana · Dhamma Page
          </p>
          <p className="text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
            Dhamma-dāna Open Repository hosted via GitHub Pages at{' '}
            <span className="font-mono-code">theartofnoting.github.io/dhamma_content</span> from{' '}
            <span className="font-mono-code">github.com/theartofnoting/dhamma_content</span>. Offered
            freely under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 for
            non-commercial practice and study.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs text-[#57534E] dark:text-[#A8A29E]">
          <button
            type="button"
            onClick={() => onNavigate('discourses')}
            className="hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
          >
            Discourses
          </button>
          <button
            type="button"
            onClick={() => onNavigate('sayadaws')}
            className="hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
          >
            Sayadaws
          </button>
          <button
            type="button"
            onClick={() => onNavigate('tips')}
            className="hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
          >
            Meditation Tips
          </button>
          <button
            type="button"
            onClick={() => onNavigate('events')}
            className="hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
          >
            Events
          </button>
          <button
            type="button"
            onClick={() => onNavigate('forms')}
            className="hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
          >
            Forms
          </button>
          <button
            type="button"
            onClick={() => onNavigate('github')}
            className="hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
          >
            GitHub Pages
          </button>
          <a
            href="https://github.com/theartofnoting/dhamma_content"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[#9A3412] dark:hover:text-[#FDBA74]"
          >
            <span>theartofnoting/dhamma_content</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="hover:text-[#9A3412] dark:hover:text-[#FDBA74] cursor-pointer"
            >
              Restore Defaults
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetArchive();
                  setConfirmReset(false);
                }}
                className="text-[#9A3412] dark:text-[#FCA5A5] font-medium underline cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="hover:text-[#1C1917] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
