import * as React from 'react';
import { Button, ButtonVariant, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { VariableRow } from './types';
import { EnvVarType } from '../utils/types';
import EnvVariablesVariable from './EnvVariablesVariable';

type EnvVariablesRowProps = {
  variableRow: VariableRow;
  onUpdate: (updatedRow?: VariableRow) => void;
  onBlur: () => void;
};

const EnvVariablesRow: React.FC<EnvVariablesRowProps> = ({ variableRow, onUpdate, onBlur }) => {
  const [typeDropdownOpen, setTypeDropdownOpen] = React.useState<boolean>(false);
  const selectOptions = [
    <SelectOption value={variableRow.variableType} key={variableRow.variableType} />,
  ];

  const removeVariables = () => {
    onUpdate();
  };

  const updateVariable = (updatedVariable: EnvVarType, originalName: string) => {
    const updatedRow: VariableRow = {
      variableType: variableRow.variableType,
      variables: [...variableRow.variables],
      errors: { ...variableRow.errors },
    };
    const index = variableRow.variables.findIndex((v) => v.name === originalName);
    if (index >= 0) {
      updatedRow.variables[index] = updatedVariable;
      onUpdate(updatedRow);
    }
  };

  return (
    <div className="jsp-spawner__env-var-form__var-row">
      <Select
        className="jsp-spawner__size_options__select"
        variant={SelectVariant.single}
        isOpen={typeDropdownOpen}
        onToggle={() => setTypeDropdownOpen(!typeDropdownOpen)}
        aria-labelledby="container-size"
        selections={variableRow.variableType}
        onSelect={(e, selection) => onUpdate({ ...variableRow, variableType: selection as string })}
      >
        {selectOptions}
      </Select>
      <Button
        className="jsp-spawner__env-var-form__var-row__remove"
        variant={ButtonVariant.link}
        onClick={removeVariables}
      >
        <MinusCircleIcon />
      </Button>
      {variableRow.variables.map((variable, index) => (
        <EnvVariablesVariable
          key={index}
          variable={variable}
          variableRow={variableRow}
          onUpdateVariable={(updatedVariable) => updateVariable(updatedVariable, variable.name)}
          onBlur={onBlur}
        />
      ))}
    </div>
  );
};

export default EnvVariablesRow;
