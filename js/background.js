console.log("Background Run...");
setPermissionDefault("user");
setConfigSongDefault("off");

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

                case "getPermission":
                    getPermission(port);
                    break;

                case "setPermission":
                    setPermission(value.data);
                    break;

                case "setConfigSong":
                    setConfigSong(value.data);
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
        if(result.length === 0 || result.up_time === undefined){ //
            data_time = "default";
            console.log("Time é vazio");
        }else{
            data_time = result.up_time.time;
        }
        console.log(data_time);
        port.postMessage({type: "getTime", data: data_time});
    });
}

function getRsps(port, to){
    chrome.storage.local.get(["responsaveis", "permission_role"], function (result) {
        var error = chrome.runtime.lastError;
        var data = [];
        console.log("Result getRsps...");
        console.log(result);
        console.log("-------------");
        if(error){
            console.error(error);
        }

        if(result.responsaveis == undefined){
            console.log("Responsaveis vazio");
        }else{
            data = result.responsaveis;
        }

        if(to == "disabled"){
            port.postMessage({type: "getRsps", to: "disabled", data: data, role: result.permission_role});
        }else{
            port.postMessage({type: "getRsps", to: "active", data: data, role: result.permission_role});
        }
    });
}

function storageSS(data) {
    chrome.storage.local.get({[data.name]: []}, function (result) {
        var arraySS = result.arraySS;
        var dataTela = [];

        for(i in data.data){
            dataTela.push(data.data[i]);
        }

        if(arraySS.length != 0){
            var difference = differences(arraySS, dataTela);

        console.log('-----------------------');
        console.log(data);
        console.log(result);
        console.log(difference);
        console.log('-----------------------');

            if(difference.length > 0){
                saveData(data);
                if (difference.length < 10) {
                    for(i in difference){
                        notificar(difference[i]);
                    }
                }else{
                    console.log("Vc tem mais de 10 solicitações");
                }
            }
            
        }else{
            console.log("Nao existe dados salvos");
            saveData(data);
            for(i in dataTela){
                notificar(dataTela[i]);
            }
        }

    });
}

function saveData(array) {
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

function differences(result, array) { //array = tela
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

/***************** NOTIFICA ********************/
function notificar(array){
console.log("===== Notifica Array ====== ");
console.log(array);

    var title = "";

    if(array.responsavel == "-")
        title = "Existe uma nova solicitação";
    else{
        title = "Resposta para " + array.responsavel.substring(14);
        //alert(title);
    }

    var data = {
        "type": "basic",
        "title": title,
        "message": array.id + " - " + (array.assunto).toLowerCase(),
        "iconUrl": "img/logo.png"
    };

    chrome.notifications.create(array.url, data, function() {
        var error = chrome.runtime.lastError;
        error ? console.error(error) : console.log('Evento criado!');

        chrome.storage.local.get(["config_song"], function (result) {
            if (result.config_song == "on") {
                var audio = new Audio('song/appointed.mp3');
                audio.play();
            }
        });
    });

}

chrome.notifications.onClicked.addListener(function(id, byUser) {
    var urlSS= "https://sgd.dominiosistemas.com.br/sgsc/faces/ssc.html?ssc="+id;
    chrome.tabs.create({url: urlSS}); 
});

/////////////////////////////////////////////////////////////////////////

function setPermission(role){
    saveData({name: "permission_role", data: role});
}

function setConfigSong(status){
    saveData({name: "config_song", data: status});
}

function setPermissionDefault(role){
    chrome.storage.local.get(["permission_role"], function (result) {
        if (result.permission_role == undefined) {
            console.log("Permission Undefined");
            setPermission(role);
        }else{
            console.log("Você tem permissoes definidas");
        }
    });
}

function setConfigSongDefault(status){
    chrome.storage.local.get(["config_song"], function (result) {
        if (result.config_song == undefined) {
            console.log("Song Undefined");
            setConfigSong(status);
        }else{
            console.log("Você tem tem configurações de Som definidas");
        }
    });
}

////////////////////////////////////////////////////////////////

function isNumber(n) {
    return !isNaN(parseInt(n)) && isFinite(n);
}

