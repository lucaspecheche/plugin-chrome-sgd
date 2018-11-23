var com = chrome.runtime.connect({name: "com"});
com.onMessage.addListener(returnCall);
var time_default = 10000;

//com.postMessage({type: "getTime"}); //run

function returnCall(response){
	switch(response.type){
		case "getRsps":
			console.log('------ Get RSPS --------');
			console.log(response.data);
			break;

		case "getTime":
			console.log('------ Get time --------');
			console.log(response.data);
			break;
	}
}

$('#dataSaved').on('click', function(){
	com.postMessage({type: "getTime"});

});	