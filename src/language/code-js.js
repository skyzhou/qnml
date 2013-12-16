;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-js","qnml:code-as"],
		parse:function(match,attr,text,option){
			option = option || {};
			return new qnml.lib.highlight.Format(
				text,
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
					],
					option:option
				}
			);
		}
	});
})();