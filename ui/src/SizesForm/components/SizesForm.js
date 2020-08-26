import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import './SizesForm.css'
import DropBtn from './DropBtn.js'
import CustomPopup from './CustomPopup.js'

class SizesForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userCM: '',
            sizeList: [],
            selectedValue: '',
            sizeDesc: '',
            sizeSent: '',
            sizeDefault: (
                <p>
                    Resources will be set based on profiles configured by administrator
                </p>
            ),
        }

    }

    updateConfigmap() {
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
                this.setState({userCM: data})
                if (this.state.sizeSent != this.state.userCM['last_selected_size']) {
                    this.updateConfigmap()
                }
            }) 
    }

    updateSizes() {
        fetch('/services/jsp-api/api/sizes', {method: 'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error('Unknown error.');
                }
            })
            .then(data => {
                this.setState({sizeList: data});
            })
    }

    generateSizeDesc(event) {
        var value = event.target.text
        var json_data = {}
        var result = ''
        fetch('/services/jsp-api/api/size/'+ value, {method: 'GET'})
        .then(response => {
            if (response.ok) {
                return response.json();
            } 
            else {
                throw new Error('Unknown error.');
            }
        })
        .then(data => {
            json_data = data
            result = <>
                Size name: {json_data.name} <br/>
                Limits: <br/>
                <p>    CPU: {json_data.resources.limits.cpu} </p><br/>
                <p>    Memory: {json_data.resources.limits.memory}</p><br/>
                Requests: <br/>
                <p>    CPU: {json_data.resources.requests.cpu}</p> 
                <p>    Memory: {json_data.resources.requests.memory}</p><br/>
            </>
            this.setState({sizeDesc: result}, console.log(this.state.sizeDesc))
            });
        
    }

    waitForLoad(event) {
        var result = <p>
            Loading...
        </p>
        this.setState({sizeDesc: result}, console.log('loading size desc'));
    }

    componentDidMount() {
        this.updateConfigmap()
        this.updateSizes()
    }

    postChange(event) {
        this.setState({sizeSent: event.target.text})
        var json = JSON.stringify({last_selected_size: event.target.text})
        fetch('/services/jsp-api/api/user/configmap',
            {
                method: 'POST',
                body: json,
                headers:{
                    'Content-Type': 'application/json',
                }
            }
            )
        console.log('Size sent: ', json)
        this.updateConfigmap()
    }

    DropdownValue() {
        if (this.state.selectedValue != null && this.state.selectedValue != '') {
            return this.state.selectedValue
        }
        else {
            return "Default"
        }
    }

    CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
          }}
        >
            <Button className="SizesForm" variant="light">
                <div id="sizes" className="SizeGrid">
                    {children}
                    <p className="DropdownRight">&#x25bc;</p>
                </div>
            </Button>
        </a>
      ));

    render () {
        this.state.selectedValue = this.state.userCM['last_selected_size']
        return (
            <div font-size="150%">
                <Form>
                    <FormGroup>
                        <DropBtn onMouseEnter={() => this.updateSizes()} innerClass="SizeDropdown" text={this.DropdownValue()}>
                            <CustomPopup innerId="sizeDefaultPopup" header="Size: Default" content={this.state.sizeDefault}>
                                <Dropdown.Item className="DropdownItem" onMouseLeave={(e) => this.waitForLoad(e)} onClick={(e) => this.postChange(e)} eventKey={this.state.sizeList.length + 1}>Default</Dropdown.Item>
                            </CustomPopup>
                            {this.state.sizeList.map((value, index) => (
                                <CustomPopup innerId={value} header={("Size: " + {value})} content={this.state.sizeDesc}>
                                    <Dropdown.Item className="DropdownItem" onMouseEnter={(e) => this.generateSizeDesc(e)} onMouseLeave={(e) => this.waitForLoad(e)} onClick={(e) => this.postChange(e)} eventKey={index.toString()}>{value}</Dropdown.Item>
                                </CustomPopup>
                                )
                                )}
                        </DropBtn>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}

export default SizesForm;