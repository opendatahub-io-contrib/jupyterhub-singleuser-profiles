import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import './App.scss';
import ImageForm from '../ImageForm/ImageForm';
import SizesForm from '../SizesForm/SizesForm';
import EnvVarForm from '../EnvVarForm/EnvVarForm';

const App: React.FC = () => {
  return (
    <div className="jsp-spawner">
      <div className="jsp-spawner__header">
        <div className="jsp-spawner__header__title">Start a notebook server</div>
        <div className="jsp-spawner__header__sub-title">
          Select options for your notebook server.
        </div>
      </div>
      <ImageForm />
      <SizesForm />
      <EnvVarForm />
      <div className="jsp-spawner__buttons-bar">
        <input
          type="submit"
          value="Start server"
          className="jsp-spawner__submit-button pf-c-button pf-m-primary"
        />
      </div>
    </div>
  );
};

export default App;
