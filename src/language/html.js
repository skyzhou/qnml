;(function(){
	var highlight;
	qnml.addLanguage({
		nodeName:["qnml:html","qnml:htm"],
		parse:function(text,option){
			if(!highlight){
				highlight = new qnml.lib.highlight.Format();
			}
			return highlight.light(text,option,"html");
		},
		style:QNML.STYLE.HH
	});
})();