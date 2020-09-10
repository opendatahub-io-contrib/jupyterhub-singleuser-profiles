import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Dropdown from 'react-bootstrap/Dropdown'
import './SizesForm.css'
import DropBtn from '../../CustomElements/DropBtn.js'
import CustomPopup from '../../CustomElements/CustomPopup.js'

class SizesForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userCM: null,
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
                console.log("Received size: ", data['last_selected_size'])
                this.state.selectedValue = data['last_selected_size']
                this.setState({selectedValue: this.state.selectedValue}) // Horrible... but it works
                this.isSizeCorrect()
            }) 
    }

    updateSizes() {
        console.log("Called update Sizes")
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
                if (data.length > 3) {
                    this.updateSizes()
                }
                else {
                    this.setState({sizeList: data}, this.updateConfigmap());
                }
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
                Size name: {json_data.name}<br/>
                Limits:<br/>
                &nbsp;&nbsp;&nbsp;CPU: {json_data.resources.limits.cpu} <br/>
                &nbsp;&nbsp;&nbsp;Memory: {json_data.resources.limits.memory}<br/>
                Requests:<br/>
                &nbsp;&nbsp;&nbsp;CPU: {json_data.resources.requests.cpu}<br/>
                &nbsp;&nbsp;&nbsp;Memory: {json_data.resources.requests.memory}<br/>
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
        this.updateSizes()
        console.log("Size list:", this.state.sizeList)
        
    }

    getValue(value) {
        return value === this.state.selectedValue
    }

    isSizeCorrect() {
        console.log("Entered empty size function: ", this.state.selectedValue)
        console.log(this.state.sizeList.find(this.getValue))
        if (this.state.sizeList.find(this.getValue) === undefined) {
            this.setState({selectedValue: "Default"}, console.log("Set default size"))
            this.postChange("Default")
        }
    }

    /*sendDefaultSize() {
        if (this.state.userCM) {
            if (this.state.userCM["last_selected_size"] === '') {
                console.log("Configmap empty, setting default size")
                this.setState({sizeSent: "Default"})
                var json = JSON.stringify({last_selected_size: "Default"})
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
        }
        else {
            this.sendDefaultSize()
        }
    }*/

    postChange(text) {
        if (typeof text !== "string") {
            text = text.target.text
        }
        this.setState({sizeSent: text})
        var json = JSON.stringify({last_selected_size: text})
        fetch('/services/jsp-api/api/user/configmap',
            {
                method: 'POST',
                body: json,
                headers:{
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('Size sent: ', json);
                    this.updateConfigmap();
                }
                else {
                    throw new Error("Failed to send chosen size");
                }
            })

    }

    DropdownValue() {
        console.log("Dropdown size value: ", this.state.selectedValue)
        if (this.state.selectedValue !== null && this.state.selectedValue !== '') {
            return this.state.selectedValue
        }
        else {
            return "Default"
        }
    }

    render () {
        return (
            <div font-size="150%">
                <Form>
                    <FormGroup>
                        <DropBtn onMouseEnter={() => this.updateSizes()} innerClass="SizeDropdown" text={this.DropdownValue()}>
                            <CustomPopup innerId="sizeDefaultPopup" header="Size: Default" content={this.state.sizeDefault}>
                                <Dropdown.Item className="DropdownItem" onMouseLeave={(e) => this.waitForLoad(e)} onClick={(e) => this.postChange(e)} eventKey={this.state.sizeList.length + 1}>Default</Dropdown.Item>
                            </CustomPopup>
                            {this.state.sizeList.map((value, index) => (
                                <CustomPopup innerId={value} header={"Size: " + value} content={this.state.sizeDesc}>
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