import { useConfig } from '../../../config/ConfigContext';
import { FieldBuilder } from '../../builder/FieldBuilder';

export function FieldsStep() {
  const { config, set } = useConfig();
  return <FieldBuilder fields={config.fields} providerTypes={config.providerTypes} brand={config.identity.colors.primary} onChange={(fields) => set('fields', fields)} />;
}
