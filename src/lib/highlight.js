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
	var rn = /msie/i.test(navigator.userAgent)?"<label></label>":new Array(9).join('&nbsp;');

	//换行替换符
	var sLine = "@li"+"ne@";


	//\r - 10,\n - 13,\t - 9,\s - 32
	var blanks  = {13:sLine,10:sLine,9:rn,32:'&nbsp;',160:'&nbsp;',11:''};

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
	var rRest = /@(?:tag|tpl)(\d+)@/g;
	
	
	var highlight = {
		/** 
		 * @class qnml.lib.Format
		 * @constructor
		 * @param {String} 源码
		 * @param {Object} config 配置
		 */
		 /**
		  * @for qnml.lib.Format
		  */
		Format:function(config){

			this.index = 0;
			this.pool = {};

			if(!config){
				config = {};
			}

			if(config.keywords){
				this.keywords = new RegExp("(^|\\W)("+config.keywords.join("|")+")(\\W|$)",'g');
			}
			if(config.library){
				this.library = new RegExp("(^|\\W)("+config.library.join("|")+")(\\W|$)",'g')
			}


			this.raw = "";
			this.output = "";
			this.option = {};
		}

	}
	highlight.Format.prototype = {
		/**
		 * 将字符串临时存储起来
		 * @private
		 */
		process:function(text,module,i){
			this.index++;

			//注意、字符串里面存在缩进和实体
			var obj = {output:String(text)};
			
			this.escape.call(obj);
			this.escBlank.call(obj);

			var data = obj.output.split(sLine);

			this.pool[this.index] = {data:data,module:module};
			if(i){
				return this.index;
			}
			else{
				return "@tag"+this.index+"@";
			}
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

			if(this.keywords){
				this.output = this.output.replace(this.keywords,function(match,pre,keyword,tail){
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
			
			if(this.library){
				this.output = this.output.replace(this.library,function(match,pre,fn,tail){
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
		 * 将被替换还原
		 * @private
		 */
		restHtml:function(){
			
			var __this = this;
			var i = 0;


			this.output = this.output.replace(rRest,function(match,id){
				return __this.color(__this.pool[id]);
			});
			
			this.output =  this.output.replace(/&#38#/g,'&#');

			//剩下的不染色，直接还原
			this.output = this.output.replace(rRest,function(match,id){
				return __this.pool[id].data.join(sLine);
			});

			if(!this.option.html){
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
			var raw = {};

			this.output = this.output.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g,function(match,pre,js,end){
				
				if(!/\w/.test(js)){
					return match;
				}
				i = __this.process(js,"js",true);
				pool[i] = qnml.parse(js,'qnml:js',{html:true});
				return pre+"@tpl"+i+"@"+end;
			});


			this.output = this.output.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,function(match,pre,css,end){
				if(/style/i.test(css)){
					return match;
				}
				if(!/\w/.test(css)){
					return match;
				}
				i = __this.process(css,"css",true);
				pool[i] = qnml.parse(css,'qnml:css',{html:true});
				return pre+"@tpl"+i+"@"+end;
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

			this.output = this.output.replace(/@tpl(\d+)@/g,function(match,id){
				return pool[id];
			});

			this.restHtml();

			return '<div class="hh-code">'+this.output+'</div>';
		},
		lightCss:function(){

			var __this = this;

			this.escString().escComment();

			this.output = this.output.replace(/([\w\-])\:([^;\r\n}]+)/g,function(match,prop,val){
				return __this.process(prop,'keyword')+":"+__this.process(val,'library');
			});

			this.escBlank().restHtml();
			if(this.option.html){
				return this.output;
			}

			return '<div class="hh-code">'+this.output+'</div>';


		},
		light:function(raw,option,render){
			
			if(!option){
				option = {};
			}

			this.raw = raw;
			this.output = raw;
			this.option = option;
			this.pool = {};

			

			if(render == "html"){
				return this.lightHtml();
			}
			if(render == "css"){
				return this.lightCss();
			}

			var tt=[];t0 = new Date();

			this.escRegExp()
			this.escString()
			this.escComment()
			this.escPound()
			this.escNumber()
			this.escKeyWord()
			this.escLibrary()
			this.escape()
			this.escBlank()
			this.restHtml()


			
			if(this.option.html){
				return this.output;
			}
			return '<div class="hh-code">'+this.output+'</div>';
		}

	}
	lib.highlight = highlight;

})(qnml.lib);