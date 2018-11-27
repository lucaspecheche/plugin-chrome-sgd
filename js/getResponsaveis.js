getResposaveis();


function getResposaveis(){
	var resp = [];
	$(".tableSorter tbody tr").each(function(tr){
		var tdTable = $(this).children('td');
		var responsavel = ($(tdTable[4]).html()).trim();
		if(responsavel != "-"){
			var str = responsavel.substring(16)
			resp.push(str);
		}
	});

	var respFilter = resp.filter(function(este, i) { //Remove itens repetidos
    	return resp.indexOf(este) == i;
	});

	return respFilter;
}