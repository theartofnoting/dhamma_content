import { LOCALIZED_PAGE_COMPONENTS } from './pages';
import { useArchiveState } from './tools/useArchiveState';

export default function App() {
  const archive = useArchiveState();
  const ActiveLocalizedPage = LOCALIZED_PAGE_COMPONENTS[archive.locale];

  return <ActiveLocalizedPage archive={archive} />;
}
