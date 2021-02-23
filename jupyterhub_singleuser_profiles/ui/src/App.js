import React from 'react';
import './App.css';
import SizesForm from './SizesForm';
import ImageForm from './ImageForm';
import EnvVarForm from './EnvVarForm';
import GpuForm from './GpuForm';
import APICalls from './CustomElements/APICalls'

var API = new APICalls()

async function get_ui_config() {
  return await API.APIGet(API._UIPATH)
}

function App() {
  var ui_config = get_ui_config()

  return (
      <div className="App">
        <header className="App-header">
          <h1 id="header-text">Spawner Options</h1>
          <div className="Grid WideForm">
            <h3 className="Wide">JupyterHub Notebook Image:</h3>
            <ImageForm config={ui_config['imageConfig']}/>
          </div>
          <h3 className="Wide">Deployment size:</h3>
          <div className="WideForm">
            <div className="Grid" margin-bottom="10px">
              <h3 className="Wide">Container size:</h3>
              <SizesForm config={ui_config['sizeConfig']}/>
            </div>
            <div className="Grid">
              <h3 className="Wide">Number of required GPUs:</h3>
              <GpuForm config={ui_config['gpuConfig']}/>
            </div>
          </div>
          <EnvVarForm config={ui_config['envVarConfig']}/>
        </header>
      </div>
  );
}

export default App;
