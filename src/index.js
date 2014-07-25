/**
 *main
 */

window.qnml = window.qnml || {}; 

(function(qnml){
	
	var languages = [];

	var isInit = false;

	var style = [];

	var unknown = null;

	qnml.addLanguage = function(option){
		var nodeNames = qnml.lib.isArray.call(option.nodeName)?option.nodeName:[option.nodeName];

		for(var i=0,nn;nn = nodeNames[i];i++){
			languages.push({
				nodeName:nn,
				parse:option.parse,
				match:new RegExp("<"+nn+"([^>]*)>([\\s\\S]*?)<\\/"+nn+">",'gi')
			});
		}	

		style.push(option.style || '');
	}	
	/**
	 *将文本内容用指定的标记语言来解析
	 *@param {String} raw 文本内容
	 *@param {String} nodeName 标记语言标签
	 *@param {Object} option 选项
	 */
	qnml.parse = function(raw,nodeName,option){
		
		if(!isInit){
			this.insertStyle(style.join("\r\n"));
			isInit = true;
		}

		var lan = "qnml:unknown",raw;

		for(var i = 0,la;la = languages[i];i++){
			if(la.nodeName == nodeName){
				lan = la;
				break;
			}
		}
		raw = la.parse(raw,option);
		
		return raw;
	}
	qnml.insertStyle = function(rules){
			var node=document.createElement("style");
			node.type='text/css';
			document.getElementsByTagName("head")[0].appendChild(node);
			if(rules){
				if(node.styleSheet){
					node.styleSheet.cssText=rules;
				}else{
					node.appendChild(document.createTextNode(rules));
				}
			}
			return node.sheet||node;
	}

})(window.qnml);