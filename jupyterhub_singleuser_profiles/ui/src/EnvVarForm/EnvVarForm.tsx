import * as React from 'react';
import { Button, ButtonVariant, Form } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { APIGet, APIPost } from '../utils/APICalls';
import { CM_PATH } from '../utils/const';
import { UserConfigMapType, EnvVarType, UiConfigType } from '../utils/types';
import { CUSTOM_VARIABLE, EMPTY_KEY, VariableRow } from './types';
import EnvVariablesRow from './EnvVariablesRow';

import './EnvVarForm.scss';

type ImageFormProps = {
  uiConfig: UiConfigType;
};

const EnvVarForm: React.FC<ImageFormProps> = ({ uiConfig }) => {
  const [variableRows, setVariableRows] = React.useState<VariableRow[]>([]);
  const [savedEnvJson, setSavedEnvJson] = React.useState<string>('');

  React.useEffect(() => {
    let cancelled = false;
    APIGet(CM_PATH).then((data: UserConfigMapType) => {
      if (!cancelled) {
        const env = data.env;
        const rows: VariableRow[] = env.map((variable) => ({
          variableType: CUSTOM_VARIABLE,
          variables: [variable],
          errors: {},
        }));
        setVariableRows(rows);
        setSavedEnvJson(JSON.stringify({ env }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const postEnvChange = () => {
    const env = variableRows.reduce((acc, row) => {
      const rowVariables = row.variables.reduce(
        (variablesAcc: EnvVarType[], variable: EnvVarType) => {
          if (
            variable.name &&
            variable.name !== EMPTY_KEY &&
            variable.value &&
            !row.errors[variable.name]
          ) {
            variablesAcc.push(variable);
          }
          return variablesAcc;
        },
        [] as EnvVarType[],
      );
      acc.push(...rowVariables);
      return acc;
    }, [] as EnvVarType[]);

    const json = JSON.stringify({ env });
    if (json !== savedEnvJson) {
      setSavedEnvJson(json);
      APIPost(CM_PATH, json);
    }
  };

  const onUpdateRow = (index: number, updatedRow?: VariableRow) => {
    const updatedRows = [...variableRows];

    if (!updatedRow) {
      updatedRows.splice(index, 1);
      setVariableRows(updatedRows);
      return;
    }

    updatedRows[index] = { ...updatedRow };
    updatedRows[index].errors = {};
    for (let i = 0; i < updatedRows.length; i++) {
      if (i !== index) {
        updatedRow.variables.forEach((variable) => {
          if (updatedRows[i].variables.find((v) => v.name === variable.name)) {
            updatedRows[index].errors[variable.name] =
              'That name is already in use. Try a different name.';
          }
        });
      }
    }
    setVariableRows(updatedRows);
  };

  const addVariableRow = () => {
    const newRow: VariableRow = {
      variableType: CUSTOM_VARIABLE,
      variables: [
        {
          name: EMPTY_KEY,
          type: 'text',
          value: '',
        },
      ],
      errors: {},
    };
    setVariableRows([...variableRows, newRow]);
  };

  const renderRows = () => {
    if (!variableRows?.length) {
      return null;
    }
    return variableRows.map((row, index) => (
      <EnvVariablesRow
        key={index}
        categories={uiConfig.envVarConfig?.categories || []}
        variableRow={row}
        onUpdate={(updatedRow) => onUpdateRow(index, updatedRow)}
        onBlur={postEnvChange}
      />
    ));
  };

  return (
    <div className="jsp-spawner__option-section">
      <Form className="jsp-spawner__env-var-form">
        <div className="jsp-spawner__option-section__title">Environment variables</div>
        {renderRows()}
        <Button
          className="jsp-spawner__env-var-form__add-button"
          variant={ButtonVariant.link}
          onClick={addVariableRow}
        >
          <PlusCircleIcon />
          Add more variables
        </Button>
      </Form>
    </div>
  );
};

export default EnvVarForm;
