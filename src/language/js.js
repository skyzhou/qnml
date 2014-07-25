;(function(){
	var highlight;
	qnml.addLanguage({
		nodeName:["qnml:js","qnml:as"],
		parse:function(text,option){
			option = option || {};
			if(!highlight){
				highlight = new qnml.lib.highlight.Format(
					{
						keywords:[
							'var',
							'function',
							'if',
							'else',
							'while',
							'do',
							'switch',
							'case',
							'new',
							'continue',
							'in',
							'typeof',
							'instanceof',
							'try',
							'catch',
							'return',
							'break',
							'this',
							'delete',
							'undefined',
							'null',
							'true',
							'fale'
						],
						library:[
							'Array',
							'Boolean',
							'Date',
							'Function',
							'Number',
							'Object',
							'RegExp',
							'String',


							'Error',
							

							"decodeURI",
							"decodeURIComponent",
							"encodeURI",
							"encodeURIComponent",
							"eval",
							"isFinite",
							"isNaN",
							"parseFloat",
							"parseInt",

							"Infinity",
							"JSON",
							"Math",
							"NaN",
							"undefined",
							"null",

							"arguments",

							'document',
							'window',
							'getElementById',
							'getElementsByTagName',
							'addEventListener',
							'removeEventListener',

							'setTimeout',
							'clearTimeout',
							'setInterval',
							'clearInterval'	
						]
					}
				);
			}
			return highlight.light(text,option);
		}
	});
})();