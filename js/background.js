chrome.runtime.onConnect.addListener(function(port) {

    if(port.name == "com"){
        port.onMessage.addListener(function(value) {

            switch(value.type){
                case "getTime":
                    getTime(port);
                    break;

                case "getRsps":
                    getRsps(port, value.to);
                    break;

                case "setTime":
                    saveData(value);
                    break;

                case "storageSS":
                    storageSS(value);
                    break;
                
                case "setRsps":
                    value.action == "add" ? updateData(value) : saveData(value);
                    break;

                default:
                    console.log("Ação não entendida");
            }

        });
    }
});

/******************** STORAGE GESTOR  *************************/

function getTime(port){
    console.log("Getting....");
    chrome.storage.local.get(["up_time"], function (result) {
        var error = chrome.runtime.lastError;
        var data_time;
        if(error){
            console.error(error);
        }
        if(Object.keys(result).length === 0){
            data_time = "default";
            console.log("Time é vazio");
        }else{
            data_time = result.up_time.time;
        }
        
        port.postMessage({type: "getTime", data: data_time});
    });
}

function getRsps(port, to){
    chrome.storage.local.get(["responsaveis"], function (result) {
        var error = chrome.runtime.lastError;
        var data;
        if(error){
            console.error(error);
        }
        if(Object.keys(result).length === 0){
            console.log("Responsaveis vazio");
        }else{
            data = result.responsaveis;
        }
        if(to == "disabled"){
            port.postMessage({type: "getRsps", to: "disabled", data: data});
        }else{
            port.postMessage({type: "getRsps", to: "active", data: data});
        }
    });
}

function storageSS(data) {
    console.log("Storage...");
    chrome.storage.local.get({[data.name]: []}, function (result) {
        var arraySS = result.arraySS;
        var array = data.data;
        var copyData = data;
        var save = true;
        console.log(result);

        if(Object.keys(arraySS).length != 0){
            if (arraySS.length != array.length) {
    
                saveData(copyData);
                console.log("---Antes do Diference----");
                console.log(copyData);
                var difference = differences(arraySS, array);
                if(difference.length != 0){

                for(i in difference){
                    notificar(difference[i]);
                }

                console.log("----Pós Diference----");
                console.log(copyData);
                }
                 //save differences or all
               // }
            }else{
                console.log("Dados iguais");
            }
            
        }else{
            console.log("nao existe dados salvos");
            saveData(data);
            for(i in data.data){
                notificar(data.data[i]);
            }
        }

    });
}

function saveData(array) {
    //console.log("Name: " + array.name);
    //console.log(array);
    chrome.storage.local.set({[array.name]: array.data}, function () {
            chrome.storage.local.get([array.name], function (result) {
                console.log("Dados Inseridos: ");
                console.log(result);
            });
    });
}

function updateData(array){
    
    chrome.storage.local.get([array.name], function (result) {
        var increment;
        if(result.responsaveis == undefined){
            increment = [];
        }else{
            var increment = result.responsaveis;
        }

        for(i in array.data){
           increment.push(array.data[i]);
        }
        chrome.storage.local.set({[array.name]: increment}, function () {
                chrome.storage.local.get([array.name], function (result) {
                    console.log("Dados Inseridos: ");
                    console.log(result);
                });
        });
    });
}

function differences(result, array) {
    var iguais = [];
    var remove = [];

    for(i in array){
        for(j in result){
            if(parseInt(array[i].id) === parseInt(result[j].id)){
                iguais.push(array[i]);
                remove.push(array[i].id);
                break;
            }
        }
    }

    for(i in remove){
        for(j in array){
            if(remove[i] == array[j].id){
                array.splice(j,1);
                break;
            } 

        }
    }
    return array; //Array = Differences

}

/********************************************/



function notificar(array){
    //console.log(array);

    var data = {
        "type": "basic",
        "title": "Existe uma nova solicitação",
        "message": array.id + " - " + (array.assunto).toLowerCase(),
        "iconUrl": "img/logo.png"
    };

    chrome.notifications.create(array.id, data, function() {
        var error = chrome.runtime.lastError;
        error ? console.error(error) : console.log('Evento criado!');
    });

}

chrome.notifications.onClicked.addListener(function(id, byUser) {
    var urlSS= "https://sgd.dominiosistemas.com.br/sgsc/faces/ssc.html?ssc="+id;
    chrome.tabs.create({url: urlSS}); 
});

function isNumber(n) {
    return !isNaN(parseInt(n)) && isFinite(n);
}
