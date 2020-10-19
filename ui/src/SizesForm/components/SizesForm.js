import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Dropdown from 'react-bootstrap/Dropdown'
import './SizesForm.css'
import DropBtn from '../../CustomElements/DropBtn.js'
import CustomPopup from '../../CustomElements/CustomPopup.js'
import APICalls from '../../CustomElements/APICalls'

class SizesForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userCM: null,
            sizeList: [],
            selectedValue: '',
            sizeDesc: '',
            sizeDefault: (
                <p>
                    Resources will be set based on profiles configured by administrator
                </p>
            ),
        }
        this.API = new APICalls()

    }

    async updateConfigmap() {
        var data = await this.API.APIGet(this.API._CMPATH)
        this.setState({userCM: data, selectedValue: data['last_selected_size']}, () => {this.updateSizes()}) // selected value is initialized here
    }

    async updateSizes() {
        var data = await this.API.APIGet(this.API._SIZESPATH)
        this.setState({sizeList: data}, () => this.isSizeCorrect())
    }

    async generateSizeDesc(event) {
        var value = event.target.text
        var result = ''
        var json_data = await this.API.APIGet('/services/jsp-api/api/size/'+ value)
        result = <>
                Size name: {json_data.name}<br/>
                Limits:<br/>
                &nbsp;&nbsp;&nbsp;CPU: {json_data.resources.limits.cpu} <br/>
                &nbsp;&nbsp;&nbsp;Memory: {json_data.resources.limits.memory}<br/>
                Requests:<br/>
                &nbsp;&nbsp;&nbsp;CPU: {json_data.resources.requests.cpu}<br/>
                &nbsp;&nbsp;&nbsp;Memory: {json_data.resources.requests.memory}<br/>
            </>
        this.setState({sizeDesc: result})        
    }

    waitForLoad(event) {
        var result = <p>
            Loading...
        </p>
        this.setState({sizeDesc: result}, console.log('loading size desc'));
    }

    componentDidMount() {
        this.updateConfigmap()
    }

    isSizeCorrect() {
        console.log("Entered empty size function: ", this.state.selectedValue)
        for(var i = 0; i < this.state.sizeList.length; i++) {
            console.log(this.state.sizeList[i])
            if (this.state.sizeList[i] === this.state.selectedValue || this.state.selectedValue === "Default") {
                console.log("break")
                return
            }
        }
        this.setState({selectedValue: "Default"}, console.log("Set default size"))
        this.postChange("Default")
    }

    async postChange(text) {
        if (typeof text !== "string") {
            text = text.target.text
        }
        this.setState({selectedValue: text})
        var json = JSON.stringify({last_selected_size: text})
        var response = await this.API.APIPost(this.API._CMPATH, json)
        this.updateConfigmap()
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
