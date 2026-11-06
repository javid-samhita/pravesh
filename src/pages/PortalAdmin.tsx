import { useParams } from 'react-router-dom';
import { PortalPage } from '../components/portal/PortalPage';

/** Reviewer console: /portal/admin and /portal/admin/:id */
export default function PortalAdmin() {
  const { id } = useParams();
  return <PortalPage view={{ name: 'admin', id }} />;
}
