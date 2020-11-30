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

    async loadConfigmap() {
        var data = await this.API.APIGet(this.API._CMPATH)
        this.setState({userCM: data, selectedValue: data['last_selected_image']}, () => {this.loadImages()})
    }

    async loadImages(){
        var data = await this.API.APIGet(this.API._IMAGEPATH)
        this.setState({imageList: data}, () => this.isImageCorrect())
    }

    componentDidMount() {
        this.loadConfigmap()
    }
    
    // Checks if received image belongs to current list, and if not, selects first image of list as default
    isImageCorrect() {
        console.log("Entered image check function")
        if (this.state.imageList.includes(this.state.selectedValue)) {
            return
        }
        if (this.state.imageList.length > 0) {
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
    }

    render () {
        return (
            <div>
                <Form>
                    <FormGroup>
                        <DropBtn onMouseEnter={() => this.loadImages()} innerClass="ImageDropdown" text={this.state.selectedValue} defaultText="No images available">
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
