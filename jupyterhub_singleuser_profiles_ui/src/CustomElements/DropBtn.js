import "./DropBtn.css"
import React from 'react'
import Button from 'react-bootstrap/Button'

class DropBtn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            btnId: props.innerClass + "Btn", 
        }
    }

    dropdown(event) {
        var children = event.currentTarget.parentElement.children
        for (var i = 0; i < children.length; i++) {
            if (children[i].id === this.props.innerClass) {
                children[i].classList.toggle("show");
            }
        }
    }
    
    closeDropdown(e) {
        var btnId = this.state.btnId
        window.onclick = function(event) { 
            if (event.target.id !== btnId && event.target.id !== 'droptxt') {   //Text is also checked.
                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                    }
                }
            }
        }
    }

    //Using inner class also as name
    render () {
        return (
            <div class="dropdown">
                <Button id={this.state.btnId} variant='light' onBlur={(e) => this.closeDropdown(e)} onClick={(e) => this.dropdown(e)} className={this.props.innerClass}>
                    <p id="droptxt" className="DropdownGrid">
                        {this.props.text}
                        <p id="droptxt" className="DropdownRight">
                            &#x25bc;
                        </p>
                    </p>
                </Button>
                <div id={this.props.innerClass} class="dropdown-content">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default DropBtn
