import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import './ImageForm.css';
import DropBtn from '../../CustomElements/DropBtn.js'
import APICalls from '../../CustomElements/APICalls'

class ImageForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            imageList: [],
            selectedValue: '',
        }
        this.API = new APICalls()
    }

    async updateConfigmap() {
        var data = await this.API.APIGet(this.API._CMPATH)
        this.setState({userCM: data, selectedValue: data['last_selected_image']}, () => {this.updateImages()})
    }

    async updateImages(){
        var data = await this.API.APIGet(this.API._IMAGEPATH)
        //this.setState({imageList: data}, () => console.log("Taking image"))
        this.setState({imageList: data}, () => this.isImageCorrect())
    }

    componentDidMount() {
        this.updateConfigmap()
    }
    
    isImageCorrect() {
        console.log("Entered image check function")
        for(var i = 0; i < this.state.imageList.length; i++) {
            if (this.state.imageList[i] === this.state.selectedValue) {
                return
            }
        }
        if (this.state.imageList[0]) {
            this.setState({selectedValue: this.state.imageList[0]}, console.log("Set default image"))
            this.postChange(this.state.imageList[0])
        }     
    }

    async postChange(text) {
        if (typeof text !== "string") {
            text = text.target.text
        }
        this.setState({selectedValue: text})
        var json = JSON.stringify({last_selected_image: text})
        await this.API.APIPost(this.API._CMPATH, json)
        console.log("Sent image")
        this.updateConfigmap() // might delete if considered not necessary, but would prevent realtime CM update
    }

    DropdownValue() {
        if (this.state.selectedValue !== null && this.state.selectedValue !== '') {
            return this.state.selectedValue
        }
        else {
            if(this.state.imageList.length !== 0) {
                return this.state.imageList[0]
            }
            else {
                return "No images available"
            }
        }
    }

    render () {
        return (
            <div>
                <Form>
                    <FormGroup>
                        <DropBtn onMouseEnter={() => this.updateImages()} innerClass="ImageDropdown" text={this.DropdownValue()}>
                            {this.state.imageList.map((value, index) => (
                                <Dropdown.Item className="DropdownItem" id={value} onClick={(e) => this.postChange(e)} eventKey={index.toString()}>{value}</Dropdown.Item>
                                )
                            )}
                        </DropBtn>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}

export default ImageForm
