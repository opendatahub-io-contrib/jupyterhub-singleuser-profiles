import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';
import {
  Alert,
  Title,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import ImageForm from '../ImageForm/ImageForm';
import SizesForm from '../SizesForm/SizesForm';
import EnvVarForm from '../EnvVarForm/EnvVarForm';
import { APIGet } from '../utils/APICalls';
import { CM_PATH, FOR_USER, UI_CONFIG_PATH } from '../utils/const';
import { UiConfigType, UserConfigMapType } from '../utils/types';

import './App.scss';

const Spawner: React.FC = () => {
  const [uiConfig, setUiConfig] = React.useState<UiConfigType>();
  const [configError, setConfigError] = React.useState<string>();
  const [imageValid, setImageValid] = React.useState<boolean>(false);
  const [userConfig, setUserConfig] = React.useState<UserConfigMapType>();

  React.useEffect(() => {
    let cancelled = false;

    APIGet(CM_PATH).then((data: UserConfigMapType) => {
      if (!cancelled) {
        setUserConfig(data);
      }
    });

    APIGet(UI_CONFIG_PATH)
      .then((data: UiConfigType) => {
        if (!cancelled) {
          setUiConfig(data);
        }
      })
      .catch((e) => {
        console.error(e);
        setConfigError(e);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const renderContent = () => {
    if (configError) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WarningTriangleIcon} />
          <Title headingLevel="h5" size="lg">
            Unable to load notebook server configuration options
          </Title>
          <EmptyStateBody>Please contact your system administrator</EmptyStateBody>
        </EmptyState>
      );
    }

    if (!uiConfig || !userConfig) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <Spinner isSVG size="xl" />
        </EmptyState>
      );
    }

    return (
      <>
        <ImageForm
          uiConfig={uiConfig}
          userConfig={userConfig}
          onValidImage={() => setImageValid(true)}
        />
        <SizesForm uiConfig={uiConfig} userConfig={userConfig} />
        {uiConfig.envVarConfig?.enabled !== false && (
          <EnvVarForm uiConfig={uiConfig} userConfig={userConfig} />
        )}
        <div className="jsp-spawner__buttons-bar">
          <input
            type="submit"
            disabled={!imageValid}
            value="Start server"
            className="jsp-spawner__submit-button pf-c-button pf-m-primary"
          />
        </div>
      </>
    );
  };

  return (
    <div className="jsp-app jsp-spawner">
      <div className="jsp-app__header">
        {FOR_USER ? (
          <Alert
            isInline
            variant="info"
            title={`This notebook server is being created for ${FOR_USER}`}
          />
        ) : null}
        <div className="jsp-app__header__title">Start a notebook server</div>
        <div className="jsp-app__header__sub-title">Select options for your notebook server.</div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Spawner;
