//create common http get/post etc method here.

const HttpInterface = {
    get : (url,headers) => {
        return fetch(url,{
            method: "GET",
            headers : {
                "content-type" : "application/json",
                'accept': 'application/json',
            },
        })
        .then(res => res.json());   
    },
    post : (url,headers,data) => {
        return fetch(url,{
            method: "POST",
            headers : {
                "content-type" : "application/json",
                'accept': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json());
    }
}

export default HttpInterface;