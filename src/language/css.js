;(function(){
	var highlight;
	qnml.addLanguage({
		nodeName:["qnml:css"],
		parse:function(text,option){
			if(!highlight){
				highlight = new qnml.lib.highlight.Format();
			}
			return highlight.light(text,option,"css");
		}
	});
})();