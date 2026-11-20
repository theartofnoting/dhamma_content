import { LocalizedArchivePage, LocalizedPageProps } from './LocalizedArchivePage';

export function EnglishPage({ archive }: LocalizedPageProps) {
  return <LocalizedArchivePage locale="en" archive={archive} />;
}
