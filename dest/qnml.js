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
	 *@param {String} 标记语言标签
	 *@param {Object} 选项
	 */
	qnml.parse = function(raw,nodeName,option){
		if(!isInit){
			
			this.insertStyle(style.join("\r\n"));
			isInit = true;
		}

		var hit = false;
		for(var i = 0,la;la = languages[i];i++){
			if(la.nodeName == nodeName){
				//全文本 属性 内容
				raw = la.parse(raw,null,raw,option);
				hit = true;
				break;
			}
		}

		if(!hit){
			raw = this.parse(raw,"qnml:unknown",option);
		}

		return raw;
	}
	/**
	 *解析文本中的标记语言
	 */
	qnml.parseAll = function(raw,option){
		
		if(!isInit){
			
			this.insertStyle(style.join("\r\n"));
			isInit = true;
		}

		//
		for(var i = 0,la;la = languages[i];i++){
			raw = raw.replace(la.match,function(match,attr,text){
				return la.parse(match,attr,text,option);
			});
		}
		return raw;
	},
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
/**
 * QNML - 函数高亮库
 * @class qnml.lib
 */

//test1 var r = /['"]/,x = "xx" 字符串和正则的冲突
//test2 var r = "dd/dfd";//dfdfd  字符串和正则的冲突
//test3 var r = "/*dfdfd*/"; 字符串和注释的冲突
//test4 var r = "//dfdf";
//test5 var r = "'dfd'";
//test6 var r = '"dfd"';


qnml.lib = qnml.lib || {}; 

(function(lib){

	//换行替换符
	var sLine = "@li"+"ne@";

	//\r - 10,\n - 13,\t - 9,\s - 32
	var blanks  = {13:sLine,10:sLine,9:'&nbsp;&nbsp;&nbsp;&nbsp;',32:'&nbsp;',160:'&nbsp;',11:''};

	//注释 . 出\n以外的任何字符
	var rComments = /(\/{2,}[^\r\n]*)|(\/\*[\s\S]*?\*\/)|(<!\-\-[\s\S]*?\-\->)/g;

	//#
	var rPound = /([\r\n])(#.*)/g;　

	//字符串
	var rStr = /(\'.*?[^\\]?\')|(\".*?[^\\]?\")/g;

	//正则
	//var rRegexp = /\/.+?[^\\]\/[igm]?/g;
	var rRegexp = /([,;{(\[\s=:])(\/.+?[^\\]\/)([igm]+|[,.;)\]}\s])/g;

	//数字
	var rNumber = /(\W)(\d+)(\W|$)/g;

	//实体
	var rTag = /[<>'"&;]/g

	//换行
	var rBr = /\r\n/g;

	//缩进（换行）
	var rBlank = /[\s]/g;

	//还原
	var rRest = /@tag(\d+)@/g;
	
	
	var highlight = {
		/** 
		 * @class qnml.lib.Format
		 * @constructor
		 * @param {String} 源码
		 * @param {Object} config 可选参数
		 */
		 /**
		  * @for qnml.lib.Format
		  */
		Format:function(raw,config){
			/**
			 * @property raw 源码
			 * @type {String}
			 */
			this.raw = raw;


			/**
			 * @private 
			 */
			this.index = 0;
			/**
			 * @pravite 
			 */
			this.pool = {};


			/**
			 * @property config 选项
			 * @type {Object}
			 */
			this.config = config || {};

			if(!this.config.option){
				this.config.option = {};
			}

			/**
			 * @property output 源码
			 * @type {String}
			 */
			 //this.output = this.config.option.inner ? raw : this.trim(raw);
			this.output = raw;
		}

	}
	highlight.Format.prototype = {
		/**
		 * 将字符串临时存储起来
		 * @private
		 */
		process:function(text,module){
			this.index++;

			//注意、字符串里面存在缩进和实体
			var obj = {output:String(text)};
			
			this.escape.call(obj);
			this.escBlank.call(obj);

			var data = obj.output.split(sLine);

			this.pool[this.index] = {data:data,module:module};

			return "@tag"+this.index+"@";
		},
		/**
		 * 去掉头尾空串
		 * @private
		 */
		trim:function(raw){
			return  raw.replace(/(^[\r\n]+)|(\s+$)/g, ""); 
		},
		
		/**
		 * 解析字符串
		 * @private
		 */
		escString:function(){
			var __this = this;
			this.output = this.output.replace(rStr,function(match){
				return __this.process(match,'string');
			})
			return this;
		},

		/**
		 * 解析注释
		 * @private
		 */
		escComment:function(){
			var __this = this;
			this.output  = this.output.replace(rComments,function(match){
				return __this.process(match,'comment');
			})
			return this;
		},
		/**
		 * 解析#号后面跟着的字符串
		 * @private
		 */
		escPound:function(){
			var __this = this;
			this.output  = this.output.replace(rPound,function(match,pre,pound){
				return pre+__this.process(pound,'pound');
			})
			return this;
		},
		/**
		 * 解析正则
		 * @private
		 */
		escRegExp:function(){
			var __this = this;
			this.output = this.output.replace(rRegexp,function(match,pre,r,end){
				
				if(/^\/\//.test(r)){
					return match;
				}
				//如果是注释
				if(/[igm]/.test(end)){
					 r+=end;
					 end = '';
				}
				return pre+__this.process(r,'regexp')+end;
			})
			return this;
		},
		/**
		 * 解析数字
		 * @private
		 */
		escNumber:function(){
			var __this = this;
			this.output = this.output.replace(rNumber,function(match,pre,n,tail){
				return pre+__this.process(n,'number')+tail;
			})
			return this;
		},
		/**
		 * 解析关键字
		 * @private
		 */
		escKeyWord:function(){
			
			var __this = this;
			var keywords = this.config.keywords;
			if(keywords){
				this.output = this.output.replace(new RegExp("(^|\\W)("+keywords.join("|")+")(\\W|$)",'g'),function(match,pre,keyword,tail){
					return pre+__this.process(keyword,'keyword')+tail;
				})
			}

			return this;
		},
		/**
		 * 解析函数库
		 * @private
		 */
		escLibrary:function(){
			
			var __this = this;
			var library = this.config.library;
			
			if(library){
				this.output = this.output.replace(new RegExp("(^|\\W)("+library.join("|")+")(\\W|$)",'g'),function(match,pre,fn,tail){
					return pre+__this.process(fn,'library')+tail;
				})
			}

			return this;
		},
		/**
		 * 替换实体
		 * @private
		 */
		escape:function(){
			var __this = this;
			this.output =  this.output.replace(rTag,function(match){
				return "&#"+match.charCodeAt(0)+";";
			})
			return this;
		},
		/**
		 * 替换空白字符串
		 * @private
		 */
		escBlank:function(){
			this.output =  this.output.replace(rBr,function(match){
				return sLine;
			})
			this.output =  this.output.replace(rBlank,function(match){
				return blanks[match.charCodeAt(0)]||'';
			})
			return this;
		},
		/**
		 * 执行校验，主要防止html被多次实体，字符串内类似与注释的未被还原
		 * @private
		 */
		check:function(){
			var __this = this;
			
			this.output =  this.output.replace(/&#38#/g,'&#');

			//剩下的不染色，直接还原
			this.output = this.output.replace(rRest,function(match,id){
				return __this.pool[id].data.join('');
			});
			
			return this;
		},
		/**
		 * 将被替换还原
		 * @private
		 */
		restHtml:function(){
			
			var __this = this;
			var i = 0;


			this.output = this.output.replace(rRest,function(match,id){
				
				return __this.color(__this.pool[id]);
			});

			if(!this.config.option.inner){
				this.output =  this.output.replace(new RegExp(sLine,'g'),function(){
					i++;
					//return (i==1?"":"<br />")+__this.color({data:[i],module:'line'});
					return __this.color({data:[i],module:'line',attr:'unselectable="on"'})+"<br />";
				});
				i++;
				this.output += __this.color({data:[i],module:'line'});
			}

			
			return this;
		},
		/**
		 * 染色
		 * @private
		 */
		color:function(option){
			if(!option){
				return;
			}

			var html = [],str = option.data.length>1?sLine:'';
			for (var i = 0,len=option.data.length;i<len; i++) {
				var text =  option.data[i];
				html.push('<span '+(option.attr||'')+' class="hh-'+option.module+'">'+text+'</span>');
			};
			return html.join(str);
		},
		lightHtml:function(){
			var __this = this;
			var i = 0;
			var pool = {};

			this.output = this.output.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g,function(match,pre,js,end){
				
				if(!/\w/.test(js)){
					return match;
				}
				i++;
				pool[i] = qnml.parse(js,'qnml:code-js',{inner:true});
				return pre+"{tpl"+i+"}"+end;
			});

			this.output = this.output.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,function(match,pre,css,end){
				if(/style/i.test(css)){
					return match;
				}
				if(!/\w/.test(css)){
					return match;
				}
				i++;
				pool[i] = qnml.parse(css,'qnml:code-css',{inner:true});
				return pre+"{tpl"+i+"}"+end;
			});

			this.output = this.output.replace(/<!\-\-[\s\S]*?\-\->/g,function(match){
				return __this.process(match,'comment');
			});
			this.output = this.output.replace(/<!DOCTYPE[^>]+>/i,function(match){
				return __this.process(match,'pound');
			});


			this.output = this.output.replace(/(<\w+)(.*?)(>)/g,function(match,begin,attr,end){
				var str1 = __this.process(begin,'tag');
				var str2 = attr.replace(/([\w\-]+=)(\".*?\"|\'.*?\')/g,function(match,attr,val){
					return __this.process(attr,'attr')+__this.process(val,'string');
				});
				var str3 = __this.process(end,'tag');
				return str1+str2+str3
			})
			this.output = this.output.replace(/(\/>|<\/\w+>)/g,function(match){
				return __this.process(match,'tag');
			});

			this.escape();
			this.escBlank();

			this.output = this.output.replace(/{tpl(\d+)}/g,function(match,id){
				return pool[id];
			});

			this.restHtml().check();

			return '<div class="hh-code">'+this.output+'</div>';
		},
		lightCss:function(){
			var __this = this;

			this.escString().escComment();

			this.output = this.output.replace(/([\w\-])\:([^;\r\n}]+)/g,function(match,prop,val){
				return __this.process(prop,'keyword')+":"+__this.process(val,'library');
			});

			this.escBlank().restHtml().check();
			if(this.config.option.inner){
				return this.output;
			}

			return '<div class="hh-code">'+this.output+'</div>';


		},
		lightCode:function(){
			this.escRegExp().escString().escComment().escPound().escNumber().escKeyWord().escLibrary().escape().escBlank().restHtml().check();
			
			if(this.config.option.inner){
				return this.output;
			}
			return '<div class="hh-code">'+this.output+'</div>';
		},
		toString:function(){
			return this.lightCode();
		}

	}
	lib.highlight = highlight;

})(qnml.lib);
qnml.lib = qnml.lib || {}; 

(function(lib){
	var Ot = Object.prototype.toString;
	lib.isArray = function(){
		return Ot.call(this) == "[object Array]";
	}
	lib.tmpl = function(){
		var cache = {};
		function _getTmplStr(rawStr, mixinTmpl) {
			if(mixinTmpl) {
				for(var p in mixinTmpl) {
					var r = new RegExp('<%#' + p + '%>', 'g');
					rawStr = rawStr.replace(r, mixinTmpl[p]);
				}
			}
			return rawStr;
		};
		return function tmpl(str, data, opt) {
			opt = opt || {};
			var key = opt.key, mixinTmpl = opt.mixinTmpl, strIsKey = !/\W/.test(str);
			key = key || (strIsKey ? str : null);
			var fn = key ? cache[key] = cache[key] || tmpl(_getTmplStr(strIsKey ? document.getElementById(str).innerHTML : str, mixinTmpl)) :
			new Function("obj", "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};with(obj){_p_.push('" + str
				.replace(/[\r\t\n]/g, " ")
				.split("\\'").join("\\\\'")
				.split("'").join("\\'")
				.split("<%").join("\t")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("_p_.push('")
			+ "');}return _p_.join('');");
			return data ? fn( data ) : fn;
		};
	}();
})(qnml.lib)
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-cpp","qnml:code-h","qnml:code-c","qnml:code-cc"],
		parse:function(match,attr,text,option){
			return new qnml.lib.highlight.Format(
				text,
				{
					keywords:[
						'typedef',
						'auto',
						'double',
						'inline',
						'short',
						'typeid',
						'bool',
						'int',
						'signed',
						'typename',
						'long',
						'sizeof',
						'case',
						'enum',
						'static',
						'unsigned',
						'namespace',
						'using',
						'char',
						'virtual',
						'struct',
						'class',
						'void',
						'const',
						'private',
						'template',
						'float',
						'protected',
						'public',
						'goto',
						'if',
						'else',
						'while',
						'do',
						'switch',
						'case',
						'new',
						'continue',
						'try',
						'catch',
						'return',
						'break',
						'delete',
						'true',
						'fale'
					],
					library:[
						
					]
				}
			);
		}
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-css"],
		parse:function(match,attr,text,option){
			var hh = new qnml.lib.highlight.Format(text,{option:option});
			return hh.lightCss();
		}
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-html","qnml:code-htm"],
		parse:function(match,attr,text,option){
			var hh = new qnml.lib.highlight.Format(text);
			return hh.lightHtml();
		},
		style:'.hh-code{        font-family: Consolas, "Liberation Mono", Courier, monospace;        font-size: 12px;        line-height: 18px;        color: #333333;        margin-left:40px;        border-left: 1px solid #D4D4D4;        position:relative;        padding:10px;        word-wrap:break-word;        text-decoration:none;    }    u .hh-code{        text-decoration:none;    }    .hh-comment{        color: #999999;        font-style: italic;    }    .hh-pound{        color: #999988;    }    .hh-tag{        color:#000080;    }    .hh-attr{        color:#008080;    }    .hh-string{        color: #d14;    }    .hh-regexp{        color: #009926;    }    .hh-keyword{        font-weight: bold;    }    .hh-library{        color: #0086B3;    }    .hh-number{        color: #009999;    }    .hh-line{        position:absolute;        left:-40px;        display: inline-block;        width: 30px;        color: #aaa;        text-align: right;        padding-right: 8px;        -webkit-user-select:none;    }'
	});
})();
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
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-php"],
		parse:function(match,attr,text,option){
			return new qnml.lib.highlight.Format(
				text,
				{
					keywords:[
						'__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final', 'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor'
					],
					library:[
						'__CLASS__', '__DIR__', '__FILE__', '__FUNCTION__', '__LINE__', '__METHOD__', '__NAMESPACE__', '__TRAIT__'
					]
				}
			);
		}
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:"qnml:unknown",
		parse:function(match,attr,text,option){
			return  qnml.lib.markdown.pre(text);
		}
	});
})();