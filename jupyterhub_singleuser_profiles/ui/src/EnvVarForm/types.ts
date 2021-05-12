import { EnvVarType } from '../utils/types';

export const CUSTOM_VARIABLE = 'Custom variable';
export const EMPTY_KEY = '---NO KEY---';

export type VariableRow = {
  variableType: string;
  variables: EnvVarType[];
  errors: { [key: string]: string };
};
