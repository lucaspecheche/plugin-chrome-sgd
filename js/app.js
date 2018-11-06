var com = chrome.runtime.connect({name: "com"});
var data_element = $('input[value="Atualizar"]');
var time_default = 10000;
var update;
var time;

com.onMessage.addListener(returnCall);

//Operar com varios User ou Unico? troca todos/user
//salvar lista de user notifica
//clique e open notificacao ss
//perdir permissons
//mudar icones
//desabilitar notificações
//historico de notificvações

$(function() {

	com.postMessage({type: "getRsps", to: "actives"});
	com.postMessage({type: "getTime"}); //run

});


/*********************** Callbacks *****************************/

function returnCall(response){
	if(response.type == "getTime"){

		clearInterval(update);
		isNumber(response.data) ? time = response.data : time = time_default;

		if (time != 0 && time != 1) {
			update = setInterval(function(){
				data_element.click();
			}, time);
		}

		onChanged(update);
	}

	if (response.type == "getRsps") {
		slave(response.data);
	}
}


function onChanged(update) {
	chrome.storage.onChanged.addListener(function(value, namespace) {
		
		var newUp_time = value.up_time.newValue.time;
		//var old_time = value.up_time.oldValue.time;
		clearInterval(update);

		if (newUp_time != 0) {
			update = setInterval(function(){
				data_element.click();
			}, newUp_time);
		}
		//chrome.tabs.reload();
	});
}


/************************ Captura dados tela ****************************/

function slave(rsps) {
	var situacao = $('select[name="relSscForm:situacao"]').val();
	var SSs = [];
	var respAtr = [];

	for(i in rsps){
		var conc = "Novo Oeste MS - "+rsps[i];
		respAtr.push(conc);
	}
	
	respAtr.push("-"); //Padrão;

	console.log(respAtr);
	var existsTable = false;

	$(".tableSorter tbody tr").each(function(tr){
		var objSS = new Object();
		var tdTable = $(this).children('td');
		responsavel = $(tdTable[4]).html();

		for(i in respAtr){
			if(responsavel == addField(respAtr[i])){
				objSS.id = $(tdTable[0]).html().trim();
				objSS.assunto = $(tdTable[2]).children('a').html().trim();
				objSS.responsavel = responsavel.trim();
				SSs.push(objSS);
			}
		}
		existsTable = true;
	});

	if(existsTable && situacao == "-1"){
		com.postMessage({type: "storageSS", name: "arraySS", data: SSs});
	}
	
}
	
function addField(valor){
	var field = "\n"
+"                                  "+valor+"\n"+
"                                ";

	return field;
}


function isNumber(n) {
    return !isNaN(parseInt(n)) && isFinite(n);
}


