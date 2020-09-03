import React from 'react'
import './EnvVarForm.css'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import DropBtn from '../../CustomElements/DropBtn.js'

class EnvVarForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            envvars: {},
            items: [],
        }
    }

    updateVars() {
        fetch('/services/jsp-api/api/user/configmap', {method:'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error('Failed to fetch user cm');
                }
            })
            .then(data => {
                this.setState({envvars: data['env']})
                this.renderForms()
            }) 
    }

    componentDidMount() {
        this.updateVars()
    }

    onBlur(e) {
        /*var container = document.getElementById('EnvVarContainer')
        var vars = {}
        var formgroup = container.children
        for (var i = 0; i < formgroup.length; i++) {
            var children = formgroup[i].children
            var key = children[0].children[0]
            if (key.children[0].value) {
                if (key.nextSibling.value){
                    vars[key.children[0].value] = key.nextSibling.value
                }
                else {
                    vars[key.children[0].value] = key.nextSibling.placeholder
                }
            }
            else {
                if (key.nextSibling.value){
                    vars[key.children[0].placeholder] = key.nextSibling.value
                }
                else {
                    vars[key.children[0].placeholder] = key.nextSibling.placeholder
                }
                
            }
            
        }
        this.setState({envvars: vars}, function() {this.sendVars()}) */
        var container = document.getElementById('EnvVarContainer')
        var vars = {}
        for (var i = 0; i < container.children.length; i++) {
            var keyValuePair = container.children[i]
            var key = keyValuePair.children[0].children[0]
            var value = keyValuePair.children[1]
            if (key.value) {
                if (value.value) {
                    vars[key.value] = value.value
                }
                else {
                    vars[key.value] = value.placeholder
                }
            }
            else {
                if (value.value) {
                    vars[key.placeholder] = value.value
                }
                else {
                    vars[key.placeholder] = value.placeholder
                }
            }
        }
        this.setState({envvars: vars}, function() {this.sendVars()})
    }

    removeForm(e) {
        var parent = e.target.parentElement
        parent.remove()
        this.onBlur()
    }

    enterVariable(event) {
        var dropdown = event.target.parentElement.parentElement
        var key = dropdown.previousSibling
        key.placeholder = event.target.text
    }

    addForm(e){
        //Frequently used variables could also be entered as a list if there are too many of them.
        const newItem = [
            <div className="EnvVarGrid">
                <FormControl name='key' type="text" placeholder='key' onBlur={(e) => this.onBlur(e)}/>
                <DropBtn id="EnvVarDrop" innerClass="EnvVarDropdown" text=''>
                    <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="1">AWS_ACCESS_KEY_ID</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="2">AWS_SECRET_ACCESS_KEY</Dropdown.Item>
                </DropBtn>
            </div>,
            <FormControl className="InnerGap" type="text" placeholder='value' onBlur={(e) => this.onBlur(e)}/>,
            <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                Remove
            </Button>
            ]
        this.setState(previousState => ({
            items: [...previousState.items, newItem]
        }));
    }

    renderForms() {
        console.log('Logging envvars:', this.state.envvars)
        for (const [key, value] of Object.entries(this.state.envvars)) {
            const newItem = [
                    <div className="EnvVarGrid">
                        <FormControl name={key} type="text" placeholder={key} onBlur={(e) => this.onBlur(e)}/>    
                        <DropBtn id="EnvVarDrop" innerClass="EnvVarDropdown" text=''>
                            <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="1">AWS_ACCESS_KEY_ID</Dropdown.Item>
                            <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="2">AWS_SECRET_ACCESS_KEY</Dropdown.Item>
                        </DropBtn>
                    </div>,
                    <FormControl className="InnerGap" type="text" placeholder={value} onBlur={(e) => this.onBlur(e)}/>,
                    <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                        Remove
                    </Button>
                    ]
            this.setState(previousState => ({
                items: [...previousState.items, newItem]
            }));
        }
    }

    sendVars(){
        var json = JSON.stringify({env: this.state.envvars})
        fetch('/services/jsp-api/api/user/configmap',
            {
                method: 'POST',
                body: json,
                headers:{
                   'Content-Type': 'application/json',
                }
            }
            )
        console.log('Sent EnvVars:', json)
    }

    render () {
        return (
            <Form className="EnvVarAccord">
                <Form.Label className="EnvVarForm">Environment Variables</Form.Label>
                <Form>
                    <FormGroup id='EnvVarContainer'>
                        {this.state.items.map(item => (
                                <Form.Row className="RowGap">{item}</Form.Row>
                        ))}
                    </FormGroup>
                    <Button variant='primary' onClick={(e) => this.addForm(e)}>
                        Add
                    </Button>
                </Form>
            </Form>
        )
    }

}

export default EnvVarForm