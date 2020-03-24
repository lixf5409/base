/**
    config = {
        id : null,          //页面锚id
        //btn : "",         //button名称, 通过是否有值判断是否启用button
        data : data,        //数据地址
        initData : "",		//要初始化的数据的id值,data为[]时有效
        initData : { 		//data为""时有效
        	value : "",		//要初始化的数据的id值
        	url : "",		//远程请求
        },
        key : null,
        panelCss : {
            width : "1.0",
            align : "left"
        },
        dataFormat : null,  //自定义每列的数据显示格式的对象数组, 每个对象定义一列数据
        callback : null     //绑定功能函数
    }
*/
define(['jquery'/*,"css!PDUtilDir/css/typeahead.css"*/], function($){
    function TypeaheadInit(config){
        var _param = {
            id: null,
            //btn : "",
            MAX_RESULT: 100,
            key: {
                id: 'id', //对应的id属性名
                data: 'data' //对应的data即name属性名
            },
            data: [],//[]或者"",[]代表一次性把要搜索的项全部加载上; ""代表搜索地址
            ignoreCase: false,           //是否忽略大小写，默认为否
            initData: '',//要初始化的数据的id值,data为[]时有效
            panelCss: {
                width: '1.0',
                align: 'left'
            },
            queryParam: {},
            paramKey: {
            	searchText: 'q' // 默认用q
            },
            //dataFormat : null,
            callback: function(data){
            }
        };
        
        config = $.extend(true, _param, config);
        var typeAhead = new Typeahead(config);
        
        return typeAhead;
    }

    function Typeahead(config){
        this.status = null;
        this.searchText = '';
        this.config = config;

        var $elem = $('#' + config.id);
        this.$typeahead = $elem.wrap('<div class="typeahead"></div>').parent('.typeahead');
        $elem.after('<div class="typeahead-suggest"></div>');
        /*
        if(!!config.btn){
            $elem.
                wrap('<div class="input-group"></div>').
                after('<span class="input-group-btn">'+
                    '<button class="btn btn-primary typeahead-submit" type="button">'+config.btn+'</button>'+
                    '</span>');
        }
        */

        //获取元素
        this.$input = $elem;
        this.$suggest = this.$typeahead.find(".typeahead-suggest");
        this.$suggest.append('<div class="items-wrapper"></div>');
        this.$wrapper = this.$typeahead.find('.items-wrapper');
        this.$suggest.css({
            width: config.panelCss.width * 100 + '%',
            left: config.panelCss.align == 'left' ? 0 : (1 - config.panelCss.width) * 100 + '%'
        });
        /*
        this.$submit = this.$typeahead.find(".typeahead-submit");
        */
        
        this.highlight = -1;//初始化当前高亮
        this.$list = null; //初始化下拉搜索结果列表
        
        //初始化已选择的值
        if(config.initData){
        	this.dataInit(config.initData);
        }
        //初始化事件
        this.bindEvent();
    }

    Typeahead.prototype = {
        //绑定内部事件
        bindEvent: function(){
            this.EventModal = new EventModal(this);
        },
        search: function(){   //检查输入
            var modal = this;
            var content = $.trim(modal.$input.val());
            modal.searchText = content;
            if(!content){
                //modal.$suggest.empty();
            	modal.$wrapper.empty();
                //modal.$suggest.append('<p class="info">请输入</p>');
            	modal.$wrapper.append('<p class="info">请输入</p>');
                modal.showSuggest();
            }else{
            	modal.getData();
            }
        },
        getData: function(){  //获取数据
            var modal = this,
                data = this.config.data,
                queryParam = this.config.queryParam,
                paramKey = this.config.paramKey;
            if($.isArray(data)){
                modal.fillSuggest(modal.dataFilter(data));//前端数据过滤
            }else if(typeof(data) == 'string'){
            	var paramData = $.extend({}, queryParam);
            	paramData[paramKey["searchText"]] = modal.searchText;
            	
                $.ajax({
                    type: 'POST',
                    url: data,
                    data: paramData,
                    dataType: 'json',
                    success: function(data){
                    	modal.fillSuggest(data);
                    },
                    error: function(){
                        console.log('Module: Typeahead - Failed to retrive remote data.');
                        return null;
                    }
                });
            }
        },
        setData: function(data){           //设置数据
        	if($.isArray(data) || typeof(data) == 'string'){
        		this.config.data = data;
        	}
        },
        fillSuggest: function(data){   //处理匹配数据并填充推荐列表
            var modal = this,
                //dataFormat = modal.config.dataFormat,
                searchText= this.searchText;
            
            //modal.$suggest.empty();//先清空
            modal.$wrapper.empty();//先清空
            if(!!data.length){
            	/*
                if(!!dataFormat){
                    var formatHtml="";
                    for(var j=0, length=dataFormat.length;j<length;j++){
                        formatHtml+="<span style='width:"+(dataFormat[j]["width"]?dataFormat[j]["width"]:100/dataFormat.length)+"%'>"+dataFormat[j]["name"]+"</span>";
                    }
                    modal.$suggest.append("<p>"+formatHtml+"</p>");
                }
                */
                for(var i=0; i<data.length; i++){
                	var d = data[i];
                	var text = (typeof d == 'object') ? d[this.config.key.data] : d;
                	var titleText = (typeof d == 'object') ? d[this.config.key.data] : d;
                	if(this.config.ignoreCase){
                		//忽略大小写
                		var search = searchText.toLowerCase();
                		var target = text.toLowerCase();          //转为小写的对比目标
                		var index = target.indexOf(search);
                		var match = text.substr(index, searchText.length);    //匹配的字符串
                		var frontStr = text.substring(0, index);
                		var rearStr = text.substr(index + searchText.length, text.length);
                		text = frontStr + '<i class="match">' + match + '</i>' + rearStr;
                	}else{
                		//区分大小写
                		text = text.replace(searchText, "<i class='match'>" + searchText + "</i>");
                	}
                	text = '<span title="' + titleText + '">' + text + '</span>';
                	var $item = $('<a href="javascript:;">' + text + '</a>');
                	$item.data('originData', data[i]); //记录原始数据
                	//modal.$suggest.append($item);
                	modal.$wrapper.append($item);
                }
                //modal.$list = modal.$suggest.children('a');//将结果缓存下来
                modal.$list = modal.$wrapper.children('a');//将结果缓存下来
                modal.highlight = -1;
            }else{
                //modal.$suggest.append("<p class='info'>无结果</p>");
            	modal.$wrapper.append('<p class="info">无结果</p>');
            }
            modal.showSuggest();
        },
        dataFilter: function(data){    //过滤匹配数据
            var dataArr = [], cur = '', count = 0, value = '';
            for (var i=0; i<data.length && count<this.config.MAX_RESULT; i++) {
                cur = data[i];
                if(typeof cur == 'object'){
                	if(this.config.ignoreCase){
                		//忽略大小写，先将目标与搜索条件转为小写
                		var target = cur[this.config.key.data].toLowerCase();
                		var search = this.searchText.toLowerCase();
                		if(target.indexOf(search) > -1){
                			dataArr.push(cur);
                            count++;
                		}
                	}else{
                		//区分大小写
                		if(cur[this.config.key.data].indexOf(this.searchText) > -1){
                			dataArr.push(cur);
                            count++;
                		}
                	}
                } else if((typeof cur == 'string')){
                	if(this.config.ignoreCase){
                		//忽略大小写，先将目标与搜索条件转为小写
                		var target = cur.toLowerCase();
                		var search = this.searchText.toLowerCase();
                		if(target.indexOf(search) > -1){
                			dataArr.push(cur);
                            count++;
                		}
                	}else{
                		//区分大小写
                		if(cur.indexOf(this.searchText) > -1){
                			dataArr.push(cur);
                            count++;
                		}
                	}
                }
            }
            return dataArr;
        },
        doEnd: function(event, $elem){ //结束后,执行回调任务,并隐藏推荐列表
            this.hideSuggest();
            this.$input.blur();
            this.config.callback($elem.data('originData'));
        },
        showSuggest: function() {
        	var modal = this;
        	this.$suggest.show();
        	
        	$(document).on('click.typeahead.' + modal.config.id, function(event) {
        		var target = event.target;
        		if (!modal.$typeahead.is(target) && modal.$typeahead.has(target).length == 0) {
        			modal.hideSuggest();
        		}
        	});
        },
        hideSuggest: function(){
        	var modal = this;
        	
        	this.$suggest.hide();
        	
        	$(document).off('click.typeahead.' + modal.config.id);
        	
        	var highlight = this.highlight;
        	var $list = this.$list;
            if (highlight != -1) {
            	$($list[highlight]).removeClass('cur');
            }
        },
        fillInput: function(val){  //回填input
            val = $.trim(val);
            this.$input.val(val);
        },
        endTimeout: function(){    //清除当前延迟匹配
            if(this.status){
            	clearTimeout(this.status);
            }
        },
        dataInit: function(initData){ //初始化已选择数据
        	var _this = this;
        	var config = _this.config;
        	var data = config.data;
        	
        	if($.isArray(data)){ //一次性加载所有搜索项
    			if (data.length > 0) {
    				for(var i=0; i<data.length; i++){
    					var item = data[i];
    					if(item[config.key.id] == initData){
    						_this.fillInput(item[config.key.data]);
    						break;
    					}
    				}
    			}
        	}else if (typeof (data) == 'string'){ //远程搜索地址
        		if(typeof initData == 'object'){
        			$.ajax({
        				url: initData.url,
        				data: {
        					value: initData.value
        				},
        				success: function(data){
        					_this.fillInput(data);
        				}
        			});
        		}
        	}
        }
    };

    //内部事件对象构造函数
    function EventModal(obj){
        $.extend(this, obj);
        var modal = this;
        
        modal.$input.on("keyup", function(event){ //监听键盘输入
            modal.keyEvent(event);
        }).on("keydown", function(event){ //监听回车
        	modal.enterEvent(event);
        }).on("focus", function(){	//监听获取焦点
            modal.search();
        }).on("input propertychange", function(){	//监听输入信息
            // 解决鼠标操作粘贴内容到文本框中无法触发事件问题-YiYing-2017.12.29
        	//IE10和IE11在placeholder改变时会触发input事件，
        	//添加下列代码，判断当前选中元素是否为typeahead绑定的元素  wyc-2018.11.22
        	if($(document.activeElement)[0] != modal.$input[0]){
        		return;
        	}
            modal.endTimeout();
            modal.status = setTimeout(function(){
                modal.search();
            }, 400);
        });
        
        modal.$suggest.on("mouseenter", "a", function(){
        	var old = modal.highlight;
        	var highlight = modal.highlight = $(this).index();
        	var $list = modal.$list;
        	
        	if (old != -1) {
            	$($list[old]).removeClass("cur");
            }
        	$($list[highlight]).addClass("cur");
        }).on("mouseup", "a", function(e){	//监听点击事件
        	modal.fillInput($(this).text());
    		modal.doEnd(e, $(this));
        });
    }

    EventModal.prototype = {
    	enterEvent : function(event) {//回车事件
    		var modal = this;
    		
			if(event.keyCode == "13"){ //回车
				event.stopPropagation();
				event.preventDefault();
				
				var highlight = modal.highlight; //当前高亮
			 	if (highlight != -1) {
			 		var $list = modal.$list;
			 		var $item = $($list[highlight]);
			 		this.fillInput($item.text());
			 		modal.doEnd(event, $item);
			 	}
			 	return false;
			}
    	},
        keyEvent : function(event){ //键盘事件
            var modal = this;
           
            if (event.keyCode == "40"||event.keyCode == "38") {//向下、向上
                event.preventDefault();
                event.stopPropagation();

                var $list = modal.$list;
                var length = $list.length;
                if(!!length && modal.$suggest.is(":visible")){
                	var highlight = modal.highlight; //当前高亮
                	var old = highlight;//记录上一个高亮
                	
                    if (event.which == "40") {//向下
                    	if (highlight == length - 1) {
                    		highlight = -1;
                    	} else highlight++;
                    }else{//向上
                    	if (highlight == -1) {
                    		highlight = length - 1;
                    	} else highlight--;
                    }
                    
                    modal.highlight = highlight;
                    if (old != -1) {
                    	$($list[old]).removeClass("cur");
                    }
                    if (highlight != -1) {
                    	modal.fillInput($($list[highlight]).addClass("cur").text());
                    } else modal.fillInput(modal.searchText);
                }
            } else {
                // 解决鼠标操作粘贴内容到文本框中无法触发事件问题-YiYing-2017.12.29
            	/*//延迟加载搜索
            	modal.endTimeout();
            	modal.status=setTimeout(function(){
            		modal.search();
            	},400);*/
            }
        }
    }; 
    
    return TypeaheadInit;
});