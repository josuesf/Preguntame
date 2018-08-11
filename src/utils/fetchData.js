
module.exports = {
    fetchData: (url,method,params, callback) => {
        const parametros = {
            method: method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        }
        fetch('http://omaralex.pythonanywhere.com' + url, parametros) //http://192.168.1.5:8000
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)
                if(responseJson.respuesta=='ok'){
                    callback(responseJson.data,undefined)
                }else{
                    callback(undefined,responseJson.respuesta)
                }
                
            })
            .catch(err => {
                callback(undefined,err)
            })
    },
    asyncFetch : async (url,method,params={},callback) => {
        const parametros = {
            method: method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        }
        const response = await fetch('http://omaralex.pythonanywhere.com'+url,parametros);
        const json = await response.json();
        callback(json)
    }
}