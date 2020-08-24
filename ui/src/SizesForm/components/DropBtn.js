import "./DropBtn.css"
import React from 'react'
import Button from 'react-bootstrap/Button'

class DropBtn extends React.Component {

    /* When the user clicks on the button,
    toggle between hiding and showing the dropdown content */
    dropdown(e) {
        e.preventDefault();
        document.getElementById("myDropdown").classList.toggle("show");
    }
    
    closeDropdown(e) {
        window.onclick = function(event) {
            if (!event.target.matches('.dropbtn')) {
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
    
    render () {
        return (
            <div class="dropdown">
                <Button variant='light' onBlur={(e) => this.closeDropdown(e)} onClick={(e) => this.dropdown(e)} className="dropbtn">Dropdown</Button>
                <div id="myDropdown" class="dropdown-content">
                    <a href="#">Link 1</a>
                    <a href="#">Link 2</a>
                    <a href="#">Link 3</a>
                </div>
            </div>
        )
    }
}

export default DropBtn