import { LocalizedArchivePage, LocalizedPageProps } from './LocalizedArchivePage';

export function VietnamesePage({ archive }: LocalizedPageProps) {
  return <LocalizedArchivePage locale="vi" archive={archive} />;
}
