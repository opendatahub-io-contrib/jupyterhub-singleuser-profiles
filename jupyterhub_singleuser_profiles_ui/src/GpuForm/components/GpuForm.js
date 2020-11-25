
import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import './GpuForm.css'
import APICalls from '../../CustomElements/APICalls'

class GpuForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gpu_value: 0,
        }
        this.API = new APICalls()
    }

    async updateGpu() {
        var data = await this.API.APIGet(this.API._CMPATH)
        this.setState({gpu_value: data['gpu']}, () => console.log('Updated GPU'))
    }

    componentDidMount() {
        this.updateGpu()
    }

    async postChange(event) {
        if (event.target.value.length === 0) {
            return
        }
        const json = JSON.stringify({
            gpu: parseInt(event.target.value)
        })
        await this.API.APIPost(this.API._CMPATH, json)
        console.log('GPU value sent')
    }

    render () {
        return (
            <div>
                <FormGroup className="GpuGroup">
                        <Form.Control id="gpu-form" className="GpuForm" type="text" placeholder={this.state.gpu_value} onChange={(e) => this.postChange(e)}/>
                </FormGroup>
            </div>
        )
    }
} 
   
export default GpuForm
