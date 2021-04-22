import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Checkbox,
  FormGroup,
  TextInput,
  TextInputTypes,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { CUSTOM_VARIABLE, EMPTY_KEY, VariableRow } from './types';
import { EnvVarType } from '../utils/types';

type EnvVariablesVariableProps = {
  variable: EnvVarType;
  variableRow: VariableRow;
  onUpdateVariable: (updatedVariable: EnvVarType) => void;
  onBlur: () => void;
};

const EnvVariablesVariable: React.FC<EnvVariablesVariableProps> = ({
  variable,
  onUpdateVariable,
  onBlur,
  variableRow,
}) => {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [variableType, setVariableType] = React.useState<string>(variable.type);

  React.useEffect(() => {
    setVariableType(variable.type);
  }, [variable.type]);

  const handleSecretChange = (checked) => {
    variable.type = checked ? 'password' : 'text';
    setVariableType(variable.type);
    onBlur();
  };

  const validated = variableRow.errors[variable.name] !== undefined ? 'error' : 'default';
  return (
    <div className="jsp-spawner__env-var-form__var-row__vars">
      <FormGroup
        fieldId={variable.name}
        label="Variable name"
        helperTextInvalid={variableRow.errors[variable.name]}
        helperTextInvalidIcon={<ExclamationCircleIcon />}
        validated={validated}
      >
        <TextInput
          id={variable.name}
          type={TextInputTypes.text}
          onChange={(newKey) =>
            onUpdateVariable({ name: newKey, type: variable.type, value: variable.value })
          }
          value={variable.name === EMPTY_KEY ? '' : variable.name}
          validated={validated}
          onBlur={onBlur}
        />
      </FormGroup>
      <FormGroup
        fieldId={`${variable.name}-value`}
        label="Variable value"
      >
        <div className="jsp-spawner__env-var-form__var-row__vars__value">
          <TextInput
            id={`${variable.name}-value`}
            type={
              showPassword && variableType === 'password'
                ? TextInputTypes.text
                : (variable.type as TextInputTypes)
            }
            value={variable.value}
            onChange={(newValue) =>
              onUpdateVariable({ name: variable.name, type: variable.type, value: newValue })
            }
            onBlur={onBlur}
          />
          {variable.type === 'password' ? (
            <Button
              className="jsp-spawner__env-var-form__toggle-password-vis"
              variant={ButtonVariant.link}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </Button>
          ) : null}
          {variableRow.variableType === CUSTOM_VARIABLE ? (
            <Checkbox
              className={variableType === 'password' ? ' m-is-secret' : ''}
              label="Secret"
              isChecked={variableType === 'password'}
              onChange={handleSecretChange}
              aria-label="secret"
              id={`${variable.name}-secret`}
              name="secret"
            />
          ) : null}
        </div>
      </FormGroup>
    </div>
  );
};

export default EnvVariablesVariable;
