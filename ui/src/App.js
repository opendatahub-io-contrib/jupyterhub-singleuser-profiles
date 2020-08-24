import React from 'react';
import './App.css';
import globals from './globals';
import SizesForm from './SizesForm';
import ImageForm from './ImageForm';
import EnvVarForm from './EnvVarForm';
import GpuForm from './GpuForm';
//import 'bootstrap/dist/css/bootstrap.min.css';
//import Navbar from 'react-bootstrap/Navbar';

globals._USERNAME = window.jhdata.user
globals._IMAGE = ''

// Navbar removed because of conflict with jupyterhub navbar
/*
        <Navbar bg="danger" variant="dark" sticky="top" expand="lg">
          <Navbar.Brand href="#home">Jupyterhub Spawner</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Signed in as: {globals._USERNAME}
            </Navbar.Text>
          </Navbar.Collapse>
        </Navbar>
*/

function App() {
  return (
      <div className="App">
        <header className="App-header">
          <h1 id="header-text">Spawner Options</h1>
          <div className="Grid" className="WideForm">
            <h3 className="Wide">JupyterHub Server Image</h3>
            <ImageForm image={globals._IMAGE} username={globals._USERNAME}/>
          </div>
          <h3 className="Wide">Deployment size:</h3>
          <div className="WideForm">
            <div className="Grid" margin-bottom="10px">
              <h3 className="Wide">Container size:</h3>
              <SizesForm username={globals._USERNAME}/>
            </div>
            <div className="Grid">
              <h3 className="Wide">GPU:</h3>
              <GpuForm username={globals._USERNAME}/>
            </div>
          </div>
          <EnvVarForm username={globals._USERNAME}/>
        </header>
      </div>
  );
}

export default App;
