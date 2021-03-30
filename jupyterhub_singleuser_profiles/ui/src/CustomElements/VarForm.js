import React from 'react'
import DropBtn from './DropBtn.js'
import Dropdown from 'react-bootstrap/Dropdown'
import './VarForm.css'
import { Checkbox } from 'react-bootstrap'

class VarForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            key: props.var_key,
            value: props.value,
            type: props.text_type,
        }
    }

    handleKeyChange(event) {
        this.setState({key: event.target.value}, () => {this.checkKey(this.state.key)})
    }

    getId(key) {
        return key + "check"+this.props.formIndex
    }

    checkKey(key) {
        if (document.getElementById(this.getId(key))) {
            if (document.getElementById(this.getId(key)).checked) {
                this.setState({type: "password"})
            }
            else {
                this.setState({type: "text"})
            }
        }
    }

    componentDidMount() {
        if (this.state.type == "password") {
            document.getElementById(this.getId(this.state.key)).checked = true
        }
        this.checkKey(this.state.key)
    }

    handleValueChange(event) {
        this.setState({value: event.target.value})
    }

    enterVariable(event) {
        this.setState({key: event.target.text, type: "password"})
        document.getElementById(this.getId(this.state.key)).checked = true
    }

    render() {
        return (
            <>
                <h3>Variable Key</h3>
                <div className="EnvVarGrid">
                    <input className="KeyForm" id={"KeyForm-"+this.state.key} name={this.state.key} type="text" value={this.state.key} onChange={(e) => this.handleKeyChange(e)}/>
                    <DropBtn id={"EnvVarDropdown"+this.props.formIndex} innerClass="VarDropdown EnvVarDropdown" text=''>
                        <Dropdown.Item onMouseDown={(e) => this.enterVariable(e)} eventKey="1">AWS_ACCESS_KEY_ID</Dropdown.Item>
                        <Dropdown.Item onMouseDown={(e) => this.enterVariable(e)} eventKey="2">AWS_SECRET_ACCESS_KEY</Dropdown.Item>
                    </DropBtn>
                </div>
                <h3>Variable Value</h3>
                <div className="CheckboxGrid">
                    <input type={this.state.type} id={"ValueForm-"+this.state.key} name={this.state.value} className="InnerGap VarValueForm"  value={this.state.value} onChange={(e) => this.handleValueChange(e)}/>
                    <p className="Secret">Secret</p>
                    <input className="VarCheckbox" type="checkbox" id={this.getId(this.state.key)} label="Secret" onClick={(e) => this.checkKey(this.state.key)}/>
                </div>
            </>
        )
    }
}

export default VarForm
