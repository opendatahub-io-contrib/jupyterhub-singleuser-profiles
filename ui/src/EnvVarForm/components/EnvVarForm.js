import React, { useState } from 'react'
import './EnvVarForm.css'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import DropBtn from '../../CustomElements/DropBtn.js'
import APICalls from '../../CustomElements/APICalls'
import VarForm from '../../CustomElements/VarForm'

class EnvVarForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            envvars: {},
            items: [],
            secrets: {},
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
        console.log("Entered Blur", e.target)
        var container = document.getElementById('EnvVarContainer')
        var vars = {}
        for (var i = 0; i < container.children.length; i++) {
            var keyValuePair = container.children[i]
            var key = keyValuePair.children[0].children[0].children[0] //should be rewritten
            var value = keyValuePair.children[0].children[1]
            console.log("BLUR key value: ", key, value)
            if (key.value) {
                if (value.value) {
                    vars[key.value] = value.value
                }
                else {
                    if (value.placeholder === "&#9679;&#9679;&#9679;&#9679;&#9679;") {  // is a password
                        vars[key.value] = this.state.secrets[key.value]
                    }
                    else {
                        vars[key.value] = value.placeholder
                    }
                }
            }
            else {
                if (value.value) {
                    vars[key.placeholder] = value.value
                }
                else {
                    if (value.placeholder === "&#9679;&#9679;&#9679;&#9679;&#9679;") {  // is a password
                        vars[key.placeholder] = this.state.secrets[key.placeholder]
                    }
                    else {
                        vars[key.placeholder] = value.placeholder
                    } 
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

    /*enterVariable(event) {
        var dropdown = event.target.parentElement.parentElement
        var key = dropdown.previousSibling
        console.log("Dropdown, key:", dropdown, key)
        key.value = event.target.text
    }*/

    makeFormItem(key, value) {
        /*var type;
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
        var keyForm = <input name={key} type="text" placeholder={key} onChange={(e) => this.handleKeyChange(e)} onBlur={(e) => this.onBlur(e)}/>
        var valueForm = <input type={type} className="InnerGap"  placeholder={value} onChange={(e) => this.handleValueChange(e)} onBlur={(e) => this.onBlur(e)}/>
        if (type == "password") {
            valueForm.placeholder = "&#9679;&#9679;&#9679;&#9679;&#9679;"
            this.state.secrets[key] = value
        }*/
        /*
        const newItem = [
            <div className="EnvVarGrid">
                {keyForm}
                <DropBtn id="EnvVarDrop" innerClass="EnvVarDropdown" text=''>
                    <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="1">AWS_ACCESS_KEY_ID</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="2">AWS_SECRET_ACCESS_KEY</Dropdown.Item>
                </DropBtn>
            </div>,
            <>
            {valueForm}
            </>,
            <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                Remove
            </Button>
            ]
        console.log(newItem)
        return newItem*/
        const newItem = [
            <div onBlur={(e) => this.onBlur(e)}>
                <VarForm var_key={key} value={value} blurFunc={this.onBlur}/>
            </div>,
            <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                Remove
            </Button>
        ]
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
