
class APICalls {

    constructor() {
    }

    APIConfigmapGet() {
        return new Promise(function (resolve, reject) {
            fetch('/services/jsp-api/api/user/configmap', {method:'GET'})
                .then(response => {
                    if (response.ok) {
                        resolve(response.json());
                    } 
                    else {
                        throw new Error('Failed to fetch User ConfigMap');
                    }
                });
                /*.then(data => {
                    console.log("Received ConfigMap: ", data)
                    return data
                })*/
        });
    }

    
    APIGet(target) {
        fetch(target, {method: 'GET'})
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
    
    APIPost(target, text) {
        if (typeof text !== "string") {
            text = text.target.text
        }
        this.setState({sizeSent: text})
        var json = JSON.stringify({last_selected_size: text})
        fetch(target,
            {
                method: 'POST',
                body: json,
                headers:{
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('ConfigMap updated: ', json);
                    this.updateConfigmap();
                }
                else {
                    throw new Error("Failed to send chosen size");
                }
            })
    
    }
}

export default APICalls

