
import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import './GpuForm.css'

class GpuForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gpu_value: 0,
        }
    }

    updateGpu() {
        fetch('/services/jsp-api/api/user/'+this.props.username+'/configmap', {method:'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error('Failed to fetch user cm');
                }
            })
            .then(data => {
                this.setState({gpu_value: data['gpu']})
            }) 
    }

    componentDidMount() {
        this.updateGpu()
    }

    postChange(event) {
        if (event.target.value.length === 0) {
            return
        }
        const obj = {
            gpu: parseInt(event.target.value)
        }
        const json = JSON.stringify(obj)
        //var json_string = '{"gpu":"'+event.target.value+'"}'
        fetch('/services/jsp-api/api/user/'+this.props.username+'/configmap', {method: 'POST', body: json, headers:{'Content-Type': 'application/json',}})
        console.log('GPU value sent:', json)
    }

    render () {
        return (
            <FormGroup>
                <Form.Control className="GpuForm" type="text" placeholder={this.state.gpu_value} onChange={(e) => this.postChange(e)}/>
            </FormGroup>
        )
    }
} 
   
export default GpuForm