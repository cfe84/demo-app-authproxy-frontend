function CallBackendAsync(method, apiUrl, body = undefined) {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.open(method, apiUrl, true);
        xhttp.onreadystatechange = () => {
            if(xhttp.readyState === XMLHttpRequest.DONE) {
                if (xhttp.status === 200) {
                    var response = JSON.parse(xhttp.responseText);
                    resolve(response);
                }
                else {
                    reject({
                        status: 200
                    })
                }
            }
        };
        xhttp.send(body);
    })
}

window.onload = () => {
    CallBackendAsync("GET", "/api/connectionInfo")
        .then((connectionInfo) => {
            document.getElementById("username").innerHTML = connectionInfo.username;
            document.getElementById("url").innerHTML = connectionInfo.url;
            document.getElementById("apiKey").innerHTML = connectionInfo.apiKey;
        }) 
}