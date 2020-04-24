import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import './SizesForm.css'

class SizesForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userCM: '',
            sizeList: [],
            selectedValue: '',
            sizeDesc: '',
        }
    }

    updateConfigmap() {
        fetch('/api/user/'+this.props.username+'/configmap', {method:'GET'})
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
            }) 
    }

    updateSizes() {
        fetch('/api/sizes', {method: 'GET'})
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
        fetch('api/size/'+ value, {method: 'GET'})
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
            result = <p>
                Size name: {json_data.name} <br/>
                Limits: CPU: {json_data.resources.limits.cpu} Memory: {json_data.resources.limits.memory} <br/>
                Requests: CPU: {json_data.resources.requests.cpu} Memory: {json_data.resources.requests.memory} <br/>
            </p>
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

    componentDidUpdate() {
        this.updateSizes()
    }

    postChange(event) {
        var json = JSON.stringify({last_selected_size: event.target.text})
        //var json_string = '{"last_selected_size":"'+event.target.text+'"}'
        fetch('/api/user/'+this.props.username+'/configmap', {method: 'POST', body: json, headers:{'Content-Type': 'application/json',}})
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
                <div className="SizeGrid">
                    {children}
                    <p className="DropdownRight">&#x25bc;</p>
                </div>
            </Button>
        </a>
      ));

    render () {
        this.state.selectedValue = this.state.userCM['last_selected_size']
        return (
            <div>
                <Form>
                    <FormGroup>
                        <Dropdown as={ButtonGroup}>
                            <Dropdown.Toggle as={this.CustomToggle} id="dropdown-custom-1">{this.DropdownValue()}</Dropdown.Toggle>
                            <Dropdown.Menu className="SizesMenu">
                                    <OverlayTrigger
                                        trigger="hover"
                                        placement="right"
                                        rootClose="true"
                                        overlay={
                                            <Popover id="popover-basic">
                                                <Popover.Title as="h3">Size: Default</Popover.Title>
                                                <Popover.Content>
                                                    <p>
                                                        Resources will be set based on profiles configured by administrator
                                                    </p>
                                                </Popover.Content>
                                            </Popover>
                                        }
                                        >
                                    <Dropdown.Item onMouseLeave={(e) => this.waitForLoad(e)} onClick={(e) => this.postChange(e)} eventKey={this.state.sizeList.length + 1}>Default</Dropdown.Item>
                                </OverlayTrigger>
                                {this.state.sizeList.map((value, index) => (
                                        <OverlayTrigger
                                        trigger="hover"
                                        placement="right"
                                        rootClose="true"
                                        overlay={
                                            <Popover id="popover-basic">
                                                <Popover.Title as="h3">Size: {value}</Popover.Title>
                                                <Popover.Content>
                                                    {this.state.sizeDesc}
                                                </Popover.Content>
                                            </Popover>
                                        }
                                        >
                                            <Dropdown.Item onMouseEnter={(e) => this.generateSizeDesc(e)} onMouseLeave={(e) => this.waitForLoad(e)} onClick={(e) => this.postChange(e)} eventKey={index.toString()}>{value}</Dropdown.Item>
                                        </OverlayTrigger>
                                    )
                                    )}
                            </Dropdown.Menu>
                        </Dropdown>{' '}
                    </FormGroup>
                </Form>
            </div>
        )
    }
}

export default SizesForm;