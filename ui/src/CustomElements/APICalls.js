
class APICalls {

    constructor() {
        this._BASEPATH = "/services/jsp-api/api/"
        this._CMPATH = this._BASEPATH + "user/configmap"
        this._SIZESPATH = this._BASEPATH + "sizes"
        this._IMAGEPATH = this._BASEPATH + "images"
        this._SINGLESIZEPATH = this._BASEPATH + "size/"
    }

    APIGet(target) {
        return new Promise(function (resolve, reject) {
            fetch(target, {method:'GET'})
                .then(response => {
                    if (response.ok) {
                        resolve(response.json());
                    } 
                    else {
                        throw new Error('Failed to fetch ' + target + response);
                    }
                });
        });
    }
    
    APIPost(target, json, target_user=null) {
        return new Promise(function (resolve, reject) {
            fetch(target,
                {
                    method: 'POST',
                    body: json,
                    headers:{
                        'Content-Type': 'application/json',
                        'For-User': target_user,
                    }
                })
                .then(response => {
                    if (response.ok) {
                        resolve(response.json())
                    }
                    else {
                        throw new Error("Failed to send", target);
                    }
                })
        })
    
    }
}

export default APICalls

