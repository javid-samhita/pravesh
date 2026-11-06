import { useParams } from 'react-router-dom';
import { PortalPage } from '../components/portal/PortalPage';

/** Applicant-facing portal: /portal, /portal/applications, /portal/applications/:id */
export default function Portal({ list }: { list?: boolean }) {
  const { id } = useParams();
  if (id) return <PortalPage view={{ name: 'application', id }} />;
  return <PortalPage view={list ? { name: 'applications' } : { name: 'apply' }} />;
}
