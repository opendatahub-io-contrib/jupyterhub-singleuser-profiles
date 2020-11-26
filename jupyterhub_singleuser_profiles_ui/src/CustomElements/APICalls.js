
class APICalls {

    constructor() {
        this._BASEPATH = "/services/jsp-api/api/"
        this._CMPATH = this._BASEPATH + "user/configmap"
        this._SIZESPATH = this._BASEPATH + "sizes"
        this._IMAGEPATH = this._BASEPATH + "images"
        this._SINGLESIZEPATH = this._BASEPATH + "size/"
    }

    APIGet(target) {
        var target_user = this.get_for_user()
        var headers = {}
        if (target_user) {
            headers['For-User'] = target_user
        }
        return new Promise(function (resolve, reject) {
            fetch(target, 
                {
                    method:'GET',
                    headers: headers
                })
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
    
    APIPost(target, json) {
        var target_user = this.get_for_user()
        var headers = {
            'Content-Type': 'application/json'
        }
        if (target_user) {
            headers['For-User'] = target_user
        }
        return new Promise(function (resolve, reject) {
            fetch(target,
                {
                    method: 'POST',
                    body: json,
                    headers: headers
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

    get_for_user() {
        if (window.jhdata['for_user']) {
           return window.jhdata['for_user']
        }
        return null
    }
}

export default APICalls

