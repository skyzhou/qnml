;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-css"],
		parse:function(match,attr,text,option){
			var hh = new qnml.lib.highlight.Format(text,{option:option});
			return hh.lightCss();
		}
	});
})();