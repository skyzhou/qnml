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