import React, { useState } from 'react'
import './EnvVarForm.css'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import DropBtn from '../../CustomElements/DropBtn.js'
import APICalls from '../../CustomElements/APICalls'

class EnvVarForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            envvars: {},
            items: [],
        }
        this.API = new APICalls()
    }

    async updateVars() {
        var data = await this.API.APIGet(this.API._CMPATH)
        this.setState({envvars: data['env']},() => {console.log("Updated EnvVars")})
        this.renderForms()
    }

    componentDidMount() {
        this.updateVars()
    }

    onBlur(e) {
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
        console.log("Dropdown, key:", dropdown, key)
        key.placeholder = event.target.text
    }

    makeFormItem(key, value) {
        var type;
        switch(key) {
            case "AWS_ACCESS_KEY_ID":
                type = "password"
                break;
            case "AWS_SECRET_ACCESS_KEY":
                type = "password"
                break;
            default:
                type = "text"
        }
        const newItem = [
            <div className="EnvVarGrid">
                <FormControl name={key} type="text" placeholder={key} value={key} onBlur={(e) => this.onBlur(e)}/>
                <DropBtn id="EnvVarDrop" innerClass="EnvVarDropdown" text=''>
                    <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="1">AWS_ACCESS_KEY_ID</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="2">AWS_SECRET_ACCESS_KEY</Dropdown.Item>
                </DropBtn>
            </div>,
            <FormControl type={type} className="InnerGap"  placeholder={value} value={value} onBlur={(e) => this.onBlur(e)}/>,
            <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                Remove
            </Button>
            ]
        console.log(newItem)
        return newItem
    }

    addForm(e){
        //Frequently used variables could also be entered as a list if there are too many of them.
        var newItem = this.makeFormItem('key', 'value')
        this.setState(previousState => ({
            items: [...previousState.items, newItem]
        }));
        
    }

    renderForms() {
        console.log('Logging envvars:', this.state.envvars)
        for (const [key, value] of Object.entries(this.state.envvars)) {
            console.log("Generating: ", key, value)
            var newItem = this.makeFormItem(key, value)
            this.setState(previousState => ({
                items: [...previousState.items, newItem]
            }), () => {console.log("Rendered item", key, value)});
        }
    }

    async sendVars(){
        var json = JSON.stringify({env: this.state.envvars})
        var response = await this.API.APIPost(this.API._CMPATH, json)
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
