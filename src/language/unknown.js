;(function(){
	qnml.addLanguage({
		nodeName:"qnml:unknown",
		parse:function(match,attr,text,option){
			return  qnml.lib.markdown.pre(text);
		}
	});
})();