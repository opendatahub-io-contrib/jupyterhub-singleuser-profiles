import React from 'react'
import DropBtn from './DropBtn.js'
import Dropdown from 'react-bootstrap/Dropdown'

class VarForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            key: props.var_key,
            value: props.value,
            type: "",
        }
    }

    handleKeyChange(event) {
        console.log("Called key change: ", event.target.value)
        this.setState({key: event.target.value}, () => {this.checkKey(this.state.key)})
    }

    checkKey(key) {
        console.log("Checking key: ", key)
        switch(key) {
            case "AWS_ACCESS_KEY_ID":
                this.setState({type: "password"})
                break;
            case "AWS_SECRET_ACCESS_KEY":
                this.setState({type: "password"})
                break;
            default:
                this.setState({type: "text"})
        }
    }

    componentDidMount() {
        this.checkKey(this.state.key)
    }

    handleValueChange(event) {
        console.log("Called value change: ", event.target.value)
        this.setState({value: event.target.value})
    }

    enterVariable(event) {
        this.setState({key: event.target.text}, () => {this.checkKey(this.state.key)})
    }

    render() {
        return (
            <>
                <div className="EnvVarGrid">
                    <input name={this.state.key} type="text" value={this.state.key} onChange={(e) => this.handleKeyChange(e)}/>
                    <DropBtn id="EnvVarDrop" innerClass="EnvVarDropdown" text=''>
                        <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="1">AWS_ACCESS_KEY_ID</Dropdown.Item>
                        <Dropdown.Item onClick={(e) => this.enterVariable(e)} eventKey="2">AWS_SECRET_ACCESS_KEY</Dropdown.Item>
                    </DropBtn>
                </div>
                <>
                    <input type={this.state.type} className="InnerGap"  value={this.state.value} onChange={(e) => this.handleValueChange(e)}/>
                </>
            </>
        )
    }
}

export default VarForm