import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import './ImageForm.css';
import DropBtn from '../../CustomElements/DropBtn.js'

class ImageForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            imageList: [],
            selectedValue: '',
        }
    }

    updateConfigmap() {
        console.log("Fetching configmap from images")
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
                console.log("Received image: ", data['last_selected_image'])
                //this.setState({selectedValue: data['last_selected_image']}, this.isImageEmpty())
                this.state.selectedValue = data['last_selected_image']
                this.setState({selectedValue: this.state.selectedValue})
                this.isImageCorrect()
            }) 
    }

    updateImages(){
        fetch('/services/jsp-api/api/images', {method: 'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error('Unknown error.');
                }
            })
            .then(data => {
                this.setState({imageList: data}, this.updateConfigmap());
            })
    }

    componentDidMount() {
        //this.updateConfigmap()
        this.updateImages()
        //this.sendInitialImage()
    }

    getValue(value) {
        return value === this.state.selectedValue
    }

    isImageCorrect() {
        console.log("Entered image check function: ", this.state.selectedValue)
        console.log(this.state.sizeList.find(this.getValue))
        if (this.state.imageList.find(this.getValue) === undefined) {
            if (this.state.imageList.length !== 0) {
                this.setState({selectedValue: this.state.imageList[0]}, console.log("Set default image"))
                //this.state.selectedValue = this.state.imageList[0]
                this.postChange(this.state.selectedValue)
            }
            else {
                this.updateImages()
            }
        }
    }

    /*sendInitialImage() {
        console.log("Configmap empty, sending initial image", this.state.imageList)
        if (this.state.imageList.length > 0) {
            var image = this.state.imageList[0]
            console.log(image)
        }
        var json = JSON.stringify({last_selected_image: image})
        fetch('/services/jsp-api/api/user/configmap',
            {
                method: 'POST',
                body: json,
                headers:{
                  'Content-Type': 'application/json',
                }
            }
            )
        console.log("Sent chosen image:", json);
        this.updateConfigmap()
    }*/

    postChange(text) {
        if (typeof text !== "string") {
            text = text.target.text
        }
        var json = JSON.stringify({last_selected_image: text})
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
                    console.log("Sent chosen image:", json);
                    this.updateConfigmap();
                }
                else {
                    throw new Error("Failed to send chosen image");
                }
            })
        
    }

    DropdownValue() {
        console.log("Dropdown image value: ", this.state.selectedValue)
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
                                <Dropdown.Item className="DropdownItem" onClick={(e) => this.postChange(e)} eventKey={index.toString()}>{value}</Dropdown.Item>
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