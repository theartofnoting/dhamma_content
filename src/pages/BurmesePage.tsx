import { LocalizedArchivePage, LocalizedPageProps } from './LocalizedArchivePage';

export function BurmesePage({ archive }: LocalizedPageProps) {
  return <LocalizedArchivePage locale="my" archive={archive} />;
}
