import "./DropBtn.css"
import React from 'react'
import Button from 'react-bootstrap/Button'

class DropBtn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            btnId: props.innerClass + "Btn", 
            isVisible: false,
        }
        this.dropdownContent = React.createRef();
    }

    handleClick(event) {
        if (this.state.isVisible) {
            this.setState({isVisible: false})
        }
        else {
            this.setState({isVisible: true})
        }
    }

    getTextOrDefault(text) {
        if (text !== null && text !== '') {
            return text
        }
        else {
            return this.props.defaultText
        }
    }
    
    handleBlur(e) {
            this.setState({isVisible: false})
        }

    render () {
        return (
            <div class="dropdown">
                <Button id={this.state.btnId} variant='light' onBlur={(e) => this.handleBlur(e)} onClick={(e) => this.handleClick(e)} className={this.props.innerClass}>
                    <p id={this.state.btnId + "text"} className="DropdownGrid">
                        {this.getTextOrDefault(this.props.text)}
                        <p id={this.state.btnId + "arrow"} className="DropdownRight">
                            &#x25bc;
                        </p>
                    </p>
                </Button>
                <div id={this.props.innerClass} ref={this.dropdownContent} class={this.state.isVisible ? "dropdown-content show" : "dropdown-content"}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default DropBtn