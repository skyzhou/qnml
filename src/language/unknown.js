;(function(){
	qnml.addLanguage({
		nodeName:"qnml:unknown",
		parse:function(text,option){
			return  qnml.lib.markdown.pre(text);
		}
	});
})();