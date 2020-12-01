import React from 'react'
import './CustomPopup.css'

class CustomPopup extends React.Component {

    handlePopup(e) {
        var popup = document.getElementById(this.props.innerId);
        popup.classList.toggle("show");
    }

    //Note: The innerId is a mandatory variable and must be unique.
    render() {
        return (
            <div className="popup" onMouseLeave={(e) => this.handlePopup(e)} onMouseEnter={(e) => this.handlePopup(e)}>
                {this.props.children}
                <span class="popuptext" id={this.props.innerId}>
                    <h3 className="PopupHeader">{this.props.header}</h3>
                    <p className="PopupPadding">
                        {this.props.content}
                    </p>
                </span>
            </div>
        )
    }

}

export default CustomPopup
