import React from 'react'
import './EnvVarForm.css';
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

class EnvVarForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            envvars: {},
            items: [],
        }
    }

    updateVars() {
        fetch('/services/jsp-api/api/user/'+this.props.username+'/configmap', {method:'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error('Failed to fetch user cm');
                }
            })
            .then(data => {
                this.setState({envvars: data['env']})
                this.renderForms()
            }) 
    }

    componentDidMount() {
        this.updateVars()
    }

    onBlur(e) {
        var container = document.getElementById('container')
        var vars = {}
        var formgroup = container.children
        for (var i = 0; i < formgroup.length; i++) {
            var children = formgroup[i].children
            var key = children[0]
            if (key.children[0].value) {
                if (key.nextSibling.value){
                    vars[key.children[0].value] = key.nextSibling.value
                }
                else {
                    vars[key.children[0].value] = key.nextSibling.placeholder
                }
            }
            else {
                if (key.nextSibling.value){
                    vars[key.children[0].placeholder] = key.nextSibling.value
                }
                else {
                    vars[key.children[0].placeholder] = key.nextSibling.placeholder
                }
                
            }
            
        }
        this.setState({envvars: vars}, function() {this.sendVars()}) 
    }

    removeForm(e) {
        var parent = e.target.parentElement
        parent.remove()
        this.onBlur()
    }

    addForm(e){
        const newItem = [
            <Dropdown className="FormDropdown" as={ButtonGroup}>
                <FormControl name='key' type="text" placeholder='key' onBlur={(e) => this.onBlur(e)}/>
                <Dropdown.Toggle split variant="outline-secondary" id="dropdown-envvar" />
                <Dropdown.Menu>
                    <Dropdown.Item eventKey="1">AWS_ACCESS_KEY_ID</Dropdown.Item>
                    <Dropdown.Item eventKey="2">AWS_SECRET_ACCESS_KEY</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>,
            <FormControl className="InnerGap" type="text" placeholder='value' onBlur={(e) => this.onBlur(e)}/>,
            <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                Remove
            </Button>
            ]
        this.setState(previousState => ({
            items: [...previousState.items, newItem]
        }));
    }

    renderForms() {
        console.log('Logging envvars:', this.state.envvars)
        for (const [key, value] of Object.entries(this.state.envvars)) {
            const newItem = [
                    <FormControl className="InnerGap" name='key' type="text" placeholder={key} onBlur={(e) => this.onBlur(e)}/>,
                    <FormControl className="InnerGap" type="text" placeholder={value} onBlur={(e) => this.onBlur(e)}/>,
                    <Button className="InnerGap" variant='danger' onClick={(e) => this.removeForm(e)}>
                        Remove
                    </Button>
                    ]
            this.setState(previousState => ({
                items: [...previousState.items, newItem]
            }));
        }
    }

    sendVars(){
        var json = JSON.stringify({env: this.state.envvars})
        fetch('/services/jsp-api/api/user/'+this.props.username+'/configmap',
            {
                method: 'POST',
                body: json,
                headers:{
                   'Content-Type': 'application/json',
                }
            }
            )
        console.log('Sent EnvVars:', json)
    }

    render () {
        return (
            <Accordion defaultActiveKey="0">
                <Card>
                    <Accordion.Toggle className="EnvVarForm" as={Card.Header} eventKey="0">
                        Environment Variables:
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <Form>
                                <FormGroup id='container'>
                                    {this.state.items.map(item => (
                                            <Form.Row className="RowGap">{item}</Form.Row>
                                    ))}
                                </FormGroup>
                                <Button variant='primary' onClick={(e) => this.addForm(e)}>
                                    Add
                                </Button>
                            </Form>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        )
    }

}

export default EnvVarForm