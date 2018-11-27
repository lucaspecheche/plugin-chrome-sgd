var com = chrome.runtime.connect({name: "com"});
com.onMessage.addListener(returnCall);
var time_default = 10000;
var senhaAdmin = "sgd1973";

com.postMessage({type: "getTime"}); //run

function returnCall(response){
	switch(response.type){

		case "getTime":
           	switch(response.data){
           		case 0:
					$('#bTimes').css('display', 'none');
					var element = $('#bOnOff');
					element.html("Ativar");
					break;

				default:
					time = (response.data/1000);
					var element = $(('#'+time)).children('a');
					element.removeClass('is-outlined');
					element.addClass('is-active');
	           	}

	        break;

        case "getRsps":
        	//alert(response.role);
        	response.to == "disabled" ? createEleResposaveisDisable(response.data, response.role) : createEleResposaveisActive(response.data);
            break;

        default:
        	console.log("Command not found");

	}
}

$('.button').on("click", function(element){
	var data = new Object();
	var span = $(this).children("span");
	var value = span[0].innerHTML;

	switch(value){
		case 'Desativar':
			data.time = 0;
			com.postMessage({type: "setTime", name: "up_time", data: data});
			setTimeout(function(){$('#tabtime').click()}, 100);
			break;

		case 'Ativar':
			buttonOn();
			break;

		case 'Atualizar':
			alterResposaveis("update");
			setTimeout(function(){$('#notactive').click()}, 300);
			break;

		case 'Adicionar':
			alterResposaveis("add");
			setTimeout(function(){$('#notactive').click()}, 300);
			break;

		case 'Confirmar Admin':
			var pass = $('#InputModelPassword').val();
			if(pass == senhaAdmin){
				com.postMessage({type: "setPermission", data: "admin"});
				setTimeout(function(){$('#tabconfig').click()}, 200);
				$('#modalPass').toggleClass('is-active');
			}else{
				$('#passIncorreta').css('display', 'block');
			}
			
			break;

		default:
			data.time = (parseInt(value)*1000);
			com.postMessage({type: "setTime", name: "up_time", data: data});
			setTimeout(function(){$('#tabtime').click()}, 100);
	}
});

/******************* Tab Time ******************/

$('#tabtime').on('click', function(){
	tabClear();
	$('#contentTime').css('display', 'block');
	$(this).addClass('is-active');

	$("#bTimes").children('div').children('a').each(function(i){
		$(this).removeClass();
		$(this).addClass("button is-info is-outlined is-small");
	});


	com.postMessage({type: "getTime"}); //run
});


/************* Tab Notificações ****************/

$('#tabntfs').on('click', function(){
	tabClear();
	$('#contentNtfs').css('display', 'block');
	$(this).addClass('is-active');
	$('#notactive').addClass('is-active');
	removeResponsaveis();
	console.log("getting responsaveis");
	com.postMessage({type: "getRsps", to: "actives"}); //recupa os responsaveis salvos
});

$('#notactive').on('click', function(){
	$('#notdisable').removeClass('is-active');
	$(this).addClass('is-active');
	$('#btnadd').css('display', 'none');
	$('#btnupdate').css('display', 'block');
	removeResponsaveis();
	com.postMessage({type: "getRsps", to: "actives"});
});

$('#notdisable').on('click', function(){
	$('#notactive').removeClass('is-active');
	$(this).addClass('is-active');
	$('#btnupdate').css('display', 'none');
	$('#btnadd').css('display', 'block');
	removeResponsaveis();
	com.postMessage({type: "getRsps", to: "disabled"});
});

function removeResponsaveis(){
	$('.responsaveis').each(function(i){
		$(this).remove();
	});
}

function alterResposaveis(action){
	var responsaveis = [];
	$('.responsaveis').each(function(i){
		var checkbox = $(this).children('input');
		if($(checkbox).is(":checked")){
			responsaveis.push($(this).children('span').html());
		}
	});

	setEleResposaveis(responsaveis, action);
	console.log(responsaveis);
}

function createEleResposaveisActive(data){
	for(i in data){
		html = '<label class="panel-block responsaveis rspActive">';
		html += '<input type="checkbox" checked>';
		html += '<span>';
		html += data[i];
		html += '</span>';
		html += '</label>';
		$('#namesSelect').append(html);
	}
}

function setEleResposaveis(data, to){
	com.postMessage({type: "setRsps", action: to, name: "responsaveis", data: data});
}

function createEleResposaveisDisable (data, role){
	if(role == "user" && data.length < 1 || role == "admin"){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    	chrome.tabs.executeScript(tabs[0].id, {file: "js/getResponsaveis.js"}, function(response){
	    		var error = chrome.runtime.lastError;
	    		error == true ? console.error(error) : console.log("Retornou");
	    		var difResponsavel = [];
	    		if(response != undefined){
	    			difResponsavel = differences(data, response[0]);
	    		}

	    		for(i in difResponsavel){
	    			html = '<label class="panel-block responsaveis rspDisable">';
					html += '<input type="checkbox">';
					html += '<span>';
					html += difResponsavel[i];
					html += '</span>';
					html += '</label>';
					$('#namesSelect').append(html);
	    		}
	    	});
	    });
	}else{
		$('#modalAlert').toggleClass('is-active');
	}
}

function differences(result, array) {
    var iguais = [];
    var remove = [];
    //console.log(result);
    

    for(i in array){
        for(j in result){
            if(array[i] == result[j]){
                iguais.push(array[i]);
                remove.push(array[i]);
                break;
            }
        }
    }

    for(i in remove){
        for(j in array){
            if(remove[i] == array[j]){
                array.splice(j,1);
                break;
            } 

        }
    }

    return array; //Array = Differences
}

/*************** Tab Configurações ****************/

function tabClear(){
	$('#contentNtfs').css('display', 'none');
	$('#contentConfig').css('display', 'none');
	$('#contentTime').css('display', 'none');

	$('.tabs li').each(function(p){
		$(this).removeClass('is-active');
	});
}

$('#tabconfig').on('click', function(){
	tabClear();
	$('#contentConfig').css('display', 'block');
	$(this).addClass('is-active');
	loadPermission();
});

//Responsaveis

$('#configRespAll').on('click', function(){
	alert("Todos")
});

$('#configRespOther').on('click', function(){
	alert("Outros")
});

//Permissions

function loadPermission(){
	var user = $('#configPermissionUser');
	var admin = $('#configPermissionAdmin');
	chrome.storage.local.get(["permission_role"], function (result) {
	if(result.permission_role == "user"){
		$(user).addClass('is-active');
		$(admin).removeClass('is-active');
	}else{
		$(user).removeClass('is-active');
		$(admin).addClass('is-active');
	}
});
}

$('#configPermissionUser').on('click', function(){
	com.postMessage({type: "setPermission", data: "user"});
	setTimeout(function(){$('#tabconfig').click()}, 200);
});

$('#configPermissionAdmin').on('click', function(){
	$('#modalPass').toggleClass('is-active');
});

$('#btnCloseModalPass').on('click', function(){
	$('#modalPass').toggleClass('is-active');
});

$('#btnCloseModalAlert').on('click', function(){
	$('#modalAlert').toggleClass('is-active');
});

/******************************************/

function buttonOn (){
	$('#bTimes').css('display', 'flex');
	var element = $('#bOnOff');
	element.html("Desativar");
}

