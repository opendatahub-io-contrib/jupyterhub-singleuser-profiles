
class APICalls {

    constructor() {
        this._CMPATH = "/services/jsp-api/api/user/configmap"
        this._SIZESPATH = "/services/jsp-api/api/sizes"
        this._IMAGEPATH = "/services/jsp-api/api/images"
    }

    APIGet(target) {
        return new Promise(function (resolve, reject) {
            fetch(target, {method:'GET'})
                .then(response => {
                    if (response.ok) {
                        resolve(response.json());
                    } 
                    else {
                        throw new Error('Failed to fetch User ConfigMap');
                    }
                });
        });
    }
    
    APIPost(target, json) {
        return new Promise(function (resolve, reject) {
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
                        resolve(response.json())
                    }
                    else {
                        throw new Error("Failed to send", json, target);
                    }
                })
        })
    
    }
}

export default APICalls

