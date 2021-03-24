import React from 'react'
import './EnvVarForm.css'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import Button from 'react-bootstrap/Button'
import APICalls from '../../CustomElements/APICalls'
import VarForm from '../../CustomElements/VarForm'

class EnvVarForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            envvars: {},
            items: [],
            secrets: {},
            index: 0,
        }
        this.API = new APICalls()
        this.envVarContainer = React.createRef()
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
        // TODO: Implement duplicate key checking
        var container = this.envVarContainer.current
        var vars = []
        var keys = []
        for (var i = 0; i < container.children.length; i++) {
            var keyValuePair = container.children[i]
            var key = keyValuePair.getElementsByClassName("KeyForm")[0]
            var value = keyValuePair.getElementsByClassName("VarValueForm")[0]
            var type = keyValuePair.getElementsByClassName("VarCheckbox")[0]
            keys.push(key.value)
            // If key already exists change color to red and block adding
            if (keys.indexOf(key.value) !== keys.lastIndexOf(key.value)) {
                key.parentElement.style.color = "red"
                continue
            }
            else {
                key.parentElement.style.color = "black"
            }
            if (type.checked === true) {
                type = "password"
            }
            else {
                type = "text"
            }
            if (key.value && value.value) {
                vars.push({
                    "name":key.value,
                    "value": value.value,
                    "type": type
                })
            }

        }
        this.setState({envvars: vars}, function() {this.sendVars()})
    }

    removeForm(e) {
        var parent = e.target.parentElement
        parent.remove()
        this.onBlur()
    }

    makeFormItem(key, value, type, index) {
        const newItem = [
            <div onBlur={(e) => this.onBlur(e)} className="VarGridDiv">
                <VarForm var_key={key} value={value} text_type={type} blurFunc={this.onBlur} formIndex={index}/>
            </div>,
            <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                Remove
            </Button>
        ]
        return newItem
    }

    addForm(e){
        //Frequently used variables could also be entered as a list if there are too many of them.
        var newItem = this.makeFormItem('', '', 'text', this.state.index.toString()) //key and value left empty
        this.setState(previousState => ({
            items: [...previousState.items, newItem]
        }));
        this.setState({index: this.state.index+1}, () => {console.log("Added item " + this.state.index.toString())})
        
    }

    renderForms() {
        
        var keys = []
        for (var i = 0; i < this.state.envvars.length;i++) {
            const envvar = this.state.envvars[i]
            if (keys.indexOf(envvar['name']) > -1) {
                continue
            }
            let newItem = this.makeFormItem(envvar['name'], envvar['value'], envvar['type'], this.state.index.toString())
            keys.push(envvar['name'])
            this.setState(previousState => ({
                items: [...previousState.items, newItem], index: this.state.index+1
            }), () => {console.log("Rendered item")});
        }
    }

    async sendVars(){
        var json = JSON.stringify({env: this.state.envvars})
        await this.API.APIPost(this.API._CMPATH, json)
    }

    render () {
        return (
            <Form className="EnvVarAccord">
                <Form.Label className="EnvVarForm">Environment Variables</Form.Label>
                <Form>
                    <FormGroup ref={this.envVarContainer} id='EnvVarContainer'>
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
