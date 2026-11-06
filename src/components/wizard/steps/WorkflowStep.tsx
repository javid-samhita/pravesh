import { useConfig } from '../../../config/ConfigContext';
import { WorkflowBuilder } from '../../builder/WorkflowBuilder';

export function WorkflowStep() {
  const { config, replace } = useConfig();
  return <WorkflowBuilder config={config} onChange={replace} />;
}
