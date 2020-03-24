/**
 * Created by weijy on 2015/6/26
 * 使用方法
 * require(["slidebar], function(slidebar){
 * 		var obj = slidebar({
 * 			"sid":"",			//slidebar组件唯一id，用来缓存的key和组件dom的id
 * 			"id":"",            //页面模板id
 *          "body":"",			//模板内容
 *          "url":"",           //远程模板url
 *          "urlCache":true,  	//是否缓存远程模板[默认缓存,url设置时有效]
 *          "cache":false,		//是否缓存[默认不缓存]
 *          "width":300,		//侧边栏宽度[不支持再使用]
 *          "size":"", 			//侧边栏宽度[支持使用：lg sm]
 *          "close":true,		//点击遮蔽层时是否关闭侧边栏
 *    		"afterLoad":null,	//模板加载完成回调
 *    		"afterOpen":null,	//侧边栏打开完成回调
 *    		"afterClose":null,	//侧边栏关闭完成回调
 *    		"onDestroy":null	//侧边栏销毁时回调
 * 		});
 * 		obj.close();
 * })
 */
define('PDUtilDir/slidebar',["jquery"/*, "css!PDUtilDir/css/slidebar"*/], function(){
	
	var cache = {}; //缓存对象
	var sidCache = {}; //sid缓存对象
	var urlCache = {};//url对应模板缓存对象
	
	function init(config) {
		config =  $.extend({
			"sid": "",			//slidebar组件唯一id，用来缓存的key和组件dom的id
			"id":"",            //页面模板id
            "body": "",			//模板内容
            "url":"",           //远程模板url
            "urlCache":true,  	//是否缓存远程模板[默认缓存,url设置时有效]
            "cache":false,		//是否缓存组件[默认不缓存]
            "size":"",			//侧边栏宽度[支持使用：lg sm]
            "width":"",			//侧边栏宽度
            "close":true,		//点击遮蔽层时是否关闭侧边栏
    		"afterLoad":null,	//模板加载完成回调
    		"afterOpen":null,	//侧边栏打开完成回调
    		"afterClose":null,	//侧边栏关闭完成回调
    		"onDestroy":null	//侧边栏销毁时回调
		}, config);
		
		if (!config.sid) {
			if (config.id) {
				config.sid = Slidebar.getSId(config.id);
			} else if (config.url) {
				config.sid = Slidebar.getSId(config.url);
			} else {
				config.sid = Slidebar.getSIdRandom();
			}
		}
		
		var slidebar;
		//判断缓存
		if (config.cache) {
			slidebar = cache[config.sid];
			if (slidebar) {
				slidebar.open();
				return slidebar;
			} else {
				slidebar = new Slidebar(config);
				return slidebar;
			}
		} else {
			slidebar = new Slidebar(config);
			return slidebar;
		}
	}
	
	function Slidebar(config) {
		this.options = config;

		Slidebar.init.call(this);
	}
	
	//定义侧边栏template
	var template = 	"<div class='cs-slidebar cs-zIndex'>" +
					"<div class='cs-slidebar-left'><i class='cs-slidebar-close glyphicon glyphicon-chevron-right'></i></div>" + 
					"<div class='cs-slidebar-content'></div>" +
				   	"</div>";
	var templateMask = "<div class='cs-slidebar-mask modal-backdrop fade'></div>";
	
	Slidebar.init = function() {
		var _this = this,
			options = _this.options;
		
		var sdom = document.getElementById(options.sid);
		if (sdom) {
			_this.$slidebar = $(sdom);
		}
		
		Slidebar.render.call(_this);
	}
	
	Slidebar.getSId = function(key) {
		var sid = sidCache[key];
		if (!sid) {
			sid = Slidebar.getSIdRandom();
			sidCache[key] = sid;
		}
		return sid;
	}
	
	Slidebar.getSIdRandom = function() {
		var date = new Date()
		var sid = "slidebar" + date.getFullYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
		return sid;
	}
	
	Slidebar.render = function() {
		var _this = this,
			options = _this.options;
		
		if (options.id) {
			Slidebar.renderById.call(_this);
		} else if (options.url) {
			Slidebar.renderByUrl.call(_this);
		} else {
			Slidebar.renderByBody.call(_this);
		}
	}
	
	Slidebar.renderById = function() {
		var _this = this,
			options = _this.options;
		
		var target = document.getElementById(options.id);
		if (!target) {
			console.log("侧边栏通过id加载html失败，请确认id属性是否设置正确！");
			return ;
		}
		
		if (_this.$slidebar) { //已经存在
			var $slidebar = _this.$slidebar;
			
			//注册事件
			Slidebar.bindEvt.call(_this);
			//触发afterLoad
			$slidebar.trigger("afterLoad");
			//侧边栏弹出
			_this.open();
		} else {
			var sid = _this.options.sid;
			//将target包装一层
			$(target).wrap("<div id='" + sid + "'></div>");
			//记录下包装的那一层
			var $wrapper = $("#" + sid);
			//初始化侧边栏JQ对象
			var $slidebar = _this.$slidebar = $(template);
			//将target放入侧边栏中
			$slidebar.find(".cs-slidebar-content").append($(target));
			//将侧边栏取代包装的那一层
			$wrapper.replaceWith($slidebar);
			//添加mask
			$slidebar.after($(templateMask));
			//显示target(target是要设置display:none的)
			$(target).show();
			//设置id
			$slidebar.attr("id", sid);
			//初始化侧边栏样式
			$slidebar.css("right", "-35%");
			if (options.width) {
				$slidebar.css("width", parseInt(options.width) + "px");
			}
			if (options.size) {
				if (options.size == "lg" || options.size == "sm") 
					$slidebar.addClass(options.size);
			}
			//初始化事件
			Slidebar.bindEvt.call(_this);
			//触发afterLoad事件
			$slidebar.trigger("afterLoad");
			//侧边栏弹出
			_this.open();
			//做缓存
			options.cache && (cache[options.sid] = _this);
		}
	}
	
	Slidebar.renderByUrl = function() {
		var _this = this,
			options = _this.options;
		
		Slidebar.loadHtml.call(_this, function(html){
			if (_this.$slidebar) { //已经存在
				_this.$slidebar.next(".cs-slidebar-mask").remove();
				_this.$slidebar.remove();
			}
			//初始化侧边栏JQ对象，并将template加载至body
			var $slidebar = _this.$slidebar = $(template).appendTo($(document.body));
			//将dom添加至侧边栏template中
			$slidebar.find(".cs-slidebar-content").html(html);
			//添加mask
			$slidebar.after($(templateMask));
			//设置id
			$slidebar.attr("id", options.sid);
			//初始化侧边栏样式
			$slidebar.css("right", "-35%");
			if (options.width) {
				$slidebar.css("width", parseInt(options.width) + "px");
			}
			if (options.size) {
				if (options.size == "lg" || options.size == "sm") 
					$slidebar.addClass(options.size);
			}
			//初始化事件
			Slidebar.bindEvt.call(_this);
			//执行双向绑定
			Slidebar.binding.call(_this);
			//触发afterLoad事件
			$slidebar.trigger("afterLoad");
			//侧边栏弹出
			_this.open();
			//做缓存
			options.cache && (cache[options.sid] = _this);
		})
	}
	
	Slidebar.renderByBody = function() {
		var _this = this,
			options = _this.options;
		
		if (_this.$slidebar) { //已经存在
			_this.$slidebar.next(".cs-slidebar-mask").remove();
			_this.$slidebar.remove();
		}
		//初始化侧边栏JQ对象，并将template加载至body
		var $slidebar = _this.$slidebar = $(template).appendTo($(document.body));
		//将dom添加至侧边栏template中
		_this.setBody(options.body);
		//$slidebar.find(".cs-slidebar-content").html(options.body);
		//添加mask
		$slidebar.after($(templateMask));
		//设置id
		$slidebar.attr("id", options.sid);
		//初始化侧边栏样式
		$slidebar.css("right", "-35%");
		if (options.width) {
			$slidebar.css("width", parseInt(options.width) + "px");
		}
		if (options.size) {
			if (options.size == "lg" || options.size == "sm") 
				$slidebar.addClass(options.size);
		}
		//初始化事件
		Slidebar.bindEvt.call(_this);
		//触发afterLoad事件
		$slidebar.trigger("afterLoad");
		//侧边栏弹出
		_this.open();
		//做缓存
		options.cache && (cache[options.sid] = _this);
	}
	
	Slidebar.binding = function() {
		var _this = this,
			$slidebar = _this.$slidebar,
			options = _this.options;
		
		if(options.$compile && options.$scope){
			var $content = $slidebar.find(".cs-slidebar-content");
			var link = options.$compile($content);
			link(options.$scope);
			options.$scope.$digest();
		}
	}
	
	/**
	 * 远程加载html
	 */
	Slidebar.loadHtml = function(callback) {
		var _this = this,
			options = _this.options;
		
		var html;
		var load = function() {
    		var deferred = $.Deferred();
    		
    		var url = _this.options.url;
			if (url) {
				if (options.urlCache) { //启用url缓存
					html = urlCache[url];
					if (html) {
						deferred.resolve();
					} else {
						require(['text!' + url],function(result){
							html = urlCache[url] = result;
							deferred.resolve();
						})
					}
				} else { //未启用缓存
					require(['text!' + url],function(result){
						html = result;
						deferred.resolve();
					})
				}
			}
    		
    		return deferred.promise();
		};
		
		//监听
    	$.when(load()).done(function(){
    		typeof callback == "function" && callback(html);
    	}).fail(function(){
    		console.log("侧边栏通过url加载html失败，请确认url属性是否设置正确！");
    	});
	}
	
	Slidebar.bindEvt = function() {
		var _this = this,
			$slidebar = _this.$slidebar,
			options = _this.options;
		
		//先移除事件绑定
		Slidebar.unbindEvt.call(_this);
		//监听关闭按钮
		$slidebar.find(".cs-slidebar-left").on("click", function(){ _this.close(); });
		//监听mask点击关闭事件
		if (options.close) {
			$slidebar.next(".cs-slidebar-mask").on("click", function(){ _this.close(); });
		}
		//注册afterLoad事件
		$slidebar.on("afterLoad", function(){
			typeof(options.afterLoad)=="function" && options.afterLoad($slidebar);
		})
		//打开
		$slidebar.on("afterOpen", function() {
			typeof options.afterOpen == "function" && options.afterOpen($slidebar);
		})
		//关闭
		$slidebar.on("afterClose", function() {
			typeof options.afterClose == "function" && options.afterClose($slidebar);
		})
		//onDestroy
		$slidebar.on("onDestroy", function(){
			typeof options.onDestroy == "function" && options.onDestroy($slidebar);
		})
	}
	
	Slidebar.unbindEvt = function() {
		var _this = this,
			$slidebar = _this.$slidebar,
			options = _this.options;
		
		$slidebar.find(".cs-slidebar-left").off("click");
		$slidebar.next(".cs-slidebar-mask").off("click");
		$slidebar.off("afterLoad");
		$slidebar.off("afterOpen");
		$slidebar.off("afterClose");
		$slidebar.off("onDestroy");
	}
	
	Slidebar.zIndex = function() {
		var _this = this,
			$slidebar = _this.$slidebar;
		//初始化zIndex;
		var zIndex = 1041;
		//获取open状态最大的zIndex;
		//$(".cs-slidebar.open").each(function(i, n){
		$(".cs-zIndex").each(function(i, n){
			var z = parseInt($(this).css("zIndex"));
			if (z >= zIndex) {
				zIndex = z + 2;
			}
		});
		$slidebar.css("zIndex", zIndex);
		$slidebar.next(".cs-slidebar-mask").css("zIndex", zIndex - 1);
	}
	
	Slidebar.fn = Slidebar.prototype;
	Slidebar.prototype.constructor = Slidebar;
	
	Slidebar.fn.open = function() {
		var _this = this,
			$slidebar = _this.$slidebar,
			options = _this.options;
		
		if (_this.$slidebar) {
			//重新计算z-index
			Slidebar.zIndex.call(_this);
			//弹出侧边编辑栏
			/*
			$slidebar.css({
				"right" : "0"
			});
			*/
			$slidebar.animate({
				"right" : 0,
				"opacity":"1"
			}, 150, function(){
				//触发afterOpen
				$slidebar.trigger("afterOpen");
			})
			$slidebar.addClass("open");
			//弹出遮蔽层
			var $mask = $slidebar.next(".cs-slidebar-mask");
			$mask.addClass("in");
			setTimeout(function(){
				$mask.css("display", "block")
			}, 150);
			//关闭body的滚动条
			$(document.body).addClass("cs-slidebar-open");
		} else {
			Slidebar.render.call(_this);
		}
	}
	
	Slidebar.fn.close = function() {
		var _this = this,
			$slidebar = _this.$slidebar,
			options = _this.options;
	
		//关闭侧边编辑栏
		/*
		$slidebar.css({
			"right" : "-" + parseInt(options.width) + "px"
		});
		*/
		$slidebar.animate({
			"right" : "-35%",
			"opacity":"0"
		}, 150, function(){
			$slidebar.removeClass("open");
			//触发afterClose
			$slidebar.trigger("afterClose");
			//destroy
			if (!options.cache && !options.id) {
				setTimeout(function(){
					_this.destroy();
				}, 150)
			}
			//恢复body的滚动条
			if ($(".cs-slidebar.open").length == 0) {
				$(document.body).removeClass("cs-slidebar-open");
			}
		});
		//关闭遮蔽层
		var $mask = $slidebar.next(".cs-slidebar-mask");
		$mask.removeClass("in");
		setTimeout(function(){
			$mask.css("display", "none");
		}, 150);
	}
	
	Slidebar.fn.destroy = function() {
		var _this = this,
			$slidebar = _this.$slidebar;
		
		//触发onDestroy事件
		$slidebar.trigger("onDestroy");
		//移除事件
		Slidebar.unbindEvt.call(_this);
		//移除dom
		$slidebar.next(".cs-slidebar-mask").remove();
		$slidebar.remove();
		
		_this.$slidebar = null;
	}
	
	Slidebar.fn.setBody = function(html) {
		var _this = this,
			options = _this.options;
			$slidebar = _this.$slidebar;
		
		options.body = html;	
		if ($slidebar) {
			$slidebar.find(".cs-slidebar-content").html(html);
			//执行双向绑定
			Slidebar.binding.call(_this);
			//触发afterLoad事件
			$slidebar.trigger("afterLoad");
		}
	}
	
	return init;
	
});
/**
 * loading组件
 * 使用方法：
 * var loading = Loading({
 * 			id : "",							//要显示在某个元素上的元素Id[默认document.body]
			modal : true,						//是否显示遮罩层[默认true]
			fontSize : "18",					//大小[默认sm(中), 还有lg(大)和xs(小)]
			text : "",							//要显示的文本内容[默认无]
			width : "100",						//高度
			height : "30",						//宽度
			html : ""							//自定义html代码[默认无]});
   });		
 * loading.show();
 * loading.close();
 */
define('PDUtilDir/loading',["jquery"/*, "css!PDUtilDir/css/loading"*/], function(){
	
	function Loading(config) {
		this.config = $.extend({
			id : "",							//要显示在某个元素上的元素Id或者dom对象[默认document.body]
			modal : true,						//是否显示遮罩层[默认true]
			fontSize : "18",					//大小[默认sm(中), 还有lg(大)和xs(小)]
			text : "",							//要显示的文本内容[默认无]
			width : "100",						//高度
			height : "30"/*,					//宽度
			html : "",*/						//要显示的html代码[默认无]
		}, config);

		Loading.init.call(this);
	}
	
	Loading.init = function() {
		var _this = this;
		if (typeof _this.config.id == "string") { //id
			_this._parent = _this.config.id ? document.getElementById(_this.config.id) : document.body;
		}
		if (typeof _this.config.id == "object") { //dom
			_this._parent = _this.config.id;
		}
		
		Loading.render.call(_this);
	}
	
	Loading.render = function() {
		var _this = this;
		//内容
		var $loading = _this._$loading = $('<div class="cs-loading"></div>');
		//遮罩层
		var $loadingMask = _this._$loadingMask = _this.config.modal ? $('<div class="cs-loading-mask"></div>') : null;
		
		var parent = _this._parent;
		if (parent == document.body) { //如果是body，直接fixed
			$loadingMask && $loadingMask.addClass("fixed");
		} else {//为父元素添加position
			var position = $(parent).css("position");
			if (position != "absolute" && position != "fixed" && position != "relative") {
				$(parent).css("position", "relative");
			}
		}
		
		var html = _this.config.html ? html : null;
		var text = _this.config.text;
		
		if (html) {//设置html
			$loading.html(html);
		} else {//设置text
			var $text = $('<span></span>').css("font-size", parseInt(_this.config.fontSize));
			var i = '<i class="fa fa-spinner fa-pulse"></i>';
			i = text ? (i + "&nbsp;" + text) : i;
			$text.html(i).appendTo($loading);
		}
		
		$(parent).append($loading);
		$loadingMask && $(parent).append($loadingMask);
		
		//设置内容宽、高
		$loading.width(parseFloat(_this.config.width)).height(parseFloat(_this.config.height));
		
		//设置居中
		var left, top, wP, hP,
			w = $loading.width(),
			h = $loading.height();
		if (parent == document.body) {
			wP = $(document).width();
			hP = $(document).height();
		} else {
			wP = $(parent).outerWidth(),
			hP = $(parent).outerHeight();
		}
		
		//计算
		left = (wP-w) / 2;
		top = (hP-h) / 2;
		
		$loading.css({
			left : left + "px",
			top : top + "px"
		})
	}
	
	Loading.prototype = {
		show : function(){
			if (!this._$loading) {
				Loading.render.call(this);
			}
			this._$loading.show();
			this._$loadingMask && this._$loadingMask.show();
			this._isShow = true; // is show flag
		},
		close : function(){
			this._$loading && this._$loading.hide() && this._$loading.remove() && (this._$loading = null);
			this._$loadingMask && this._$loadingMask.hide() && this._$loadingMask.remove() && (this._$loadingMask = null);
			this._isShow = false; 
		},
		isShow : function() {
			return this._isShow;
		}
	}
	
	Loading.prototype.constructor = Loading;
	
	return function(config) {
		return new Loading(config);
	}
	
});
define('PDUtilDir/util',
	["PDUtilDir/slidebar", 
	"PDUtilDir/loading", 
	'PDUtilDir/alert', 
	'PDUtilDir/confirm',
	"ArtTemplateNative",
	"jquery"], function(Slidebar, Loading, Alert, Confirm, ArtTemplate){
	
    var util = {};
    /**
     * 简单模板引擎
     */
    util.template = (function(){
        //var cache = {};
        return function(str, data) {
        	return ArtTemplate(str, data);
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
        	//------------------------------------------------//
        	/*
            var fn = !/\W/.test(str) ? cache[str] = cache[str] || util.template(document.getElementById(str).innerHTML) :
                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +
                    // Convert the template into pure JavaScript
                    str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
            // Provide some basic currying to the user
            return data ? fn(data) : fn;
            */
            //------------------------------------------------//
        };
    })();

    /**
     * 用法：require(["PDUtilDir/util"],function(u){u.alert("请填写基本信息！")})
     * @param message
     * @param title
     */
    util.alert = function(message, title, afterClose){
    	var config = {
    		events: {}
    	};
    	
		if(typeof(message) == 'object'){
			config = message;
		}else{
			config.message = message;
			if(typeof(title) == 'function'){
				config.title = '系统信息';
				config.events.afterClose = title;
			}else{
				config.title = title ? title: '系统信息';
				config.events.afterClose = afterClose;
			}
		}
		
    	Alert(config);
    };

    /**
     * 用法：require(["PDUtilDir/util"],function(u){u.confirm("确认提交？",function(){console.log("是")},function(){console.log("否")})})
     * @param message
     * @param okCallback
     * @param cancelCallback
     */
    util.confirm = function(message, yesCallback, noCallback, afterClose){//整合回调函数成一个,利用回传参数判断是否成功
    	var config = {
    		events: {}
    	};
        
        if(typeof(message) == 'object'){
        	config = message;
        }else{
        	config.message = message;
        	config.events.onConfirm = yesCallback;
        	config.events.onCancel = noCallback;
        	config.events.afterClose = afterClose;
        }
    	
    	Confirm(config);
    };
    /**
     * config = {
     *   setting : {},                   //dialogSetting
     *   template : templateURL,         //dialogBodyTemplate
     *   afterLoad : function(dialog){},   //afterDialogLoaded callback
     * }
     */
    util.contentDialog = function(config){
        config.setting = $.extend({
            cache : true,
            dialogSize: "modal-lg",
            title : "Dialog",
            id : "system_dialog_contentDialog",
            modal : "hide"
        },config.setting);
        require(["PDUtilDir/dialog","text!"+config.template],function(Dialog,template){
            dialog = Dialog(config.setting);
            dialog.setBody(template);
            (typeof config.afterLoad == "function") && config.afterLoad(dialog);
            dialog.show();
        });
    };
    
    /**
     * 弹出侧边编辑栏组件
     */
    util.slidebar = function(config) {
    	return Slidebar(config);
    }
    
    /*
    util.slidebar = (function(){
        var cache = {};
        return function(config){
            var param = $.extend({
                "id":"",            //直接把模板放页面上
                "url":"",           //URL远程获取模板
                "width":"",
                "cache":true,
                "close":false,      //点击侧边栏之外的区域是否能关闭侧边栏
                "allowClick":[]
            },config);

            //侧边栏对象
            var $Panel;

            var isAllowTarget = function(e){
                //增加对boostrap date组件的支持(由于该组件的HTML自动追加在body上)
                var arr = param.allowClick.concat($('.datetimepicker'));
                for(var i= 0,item;item=arr[i++];){
                    if($(item).is(e.target) || $(item).has(e.target).length){
                        return true;
                    }
                }
                return false;
            };

            var render = function(){
                //设置弹出面板样式
            	$Panel.css({
            		"width":param.width,
            		"right":"-"+param.width
            	});
                //弹出侧边编辑栏
                $Panel.animate({right : 0}, 350,function(){
                    //回调函数执行
                    //typeof(param.afterLoad)=="function" && param.afterLoad.apply(this);
                });
                //添加点击侧边栏之外的元素关闭侧边栏事件监听
                var $target = $(".body_wrap") || $(document.body);
                param.close && $target.unbind("mouseup").bind("mouseup",function(e) {
                    //不是目标区域且不是子元素,且不是自定义允许点击节点
                    if ((!$Panel.is(e.target) && $Panel.has(e.target).length === 0) && !isAllowTarget(e)) {
                        //关闭页面
                        closeSlidebar();
                        //取消事件
                        $target.unbind("mouseup");
                    }
                });
                //增加以添加样式即可关闭侧边栏的方法
                $Panel.find(".closeBtn").on("click",function(e){
                    closeSlidebar();
                });
            };

            //关闭侧边栏方法
            var closeSlidebar = function(){
                $Panel.animate({right: "-"+param.width}, 150,function(){
                    typeof(param.afterClose)=="function" && param.afterClose.apply(this);
                    //如果不缓存,且侧边栏的DOM来自于远程连接，则删除DOM
                    (!param.cache && param.url) && $Panel.remove();
                });
            };
            
            //增加左侧关闭
            var addClose = function(){
                var $left = $("<div class='cs-slidebar-left'><i class='glyphicon glyphicon-chevron-right cs-slidebar-close'></i></div>");
                //设置按钮出现的位置
                //添加关闭侧边栏的事件
                $left.bind("click",function(){
                    closeSlidebar($Panel);
                });
                return $left;
            };
            
            $Panel = cache[param.id || param.url];
            
            if (param.cache && $Panel) {
            	render();
            } else {
            	var $Dom = null;
            	
            	var getDom = function() {
            		var deferred = $.Deferred();
            		
            		//先根据id查找本页dom元素
            		$Dom = param.id && $("#" + param.id);
            		if ($Dom && $Dom[0]) {
            			deferred.resolve();
            		} else {
            			if (!param.url) {
            				deferred.reject();
            			} else {
            				require(['text!'+param.url],function(panel){
                    			$Dom = $(panel);
                    			deferred.resolve();
                    		})
            			}
            		}
            		
            		return deferred.promise();
            	}
            	
            	//监听
            	$.when(getDom()).done(function(){
            		$Panel = $("<div class='cs-slidebar'></div>")
            			.append(addClose())
            			.appendTo($(document.body));
            		var $Content = $("<div class='cs-slidebar-content'></div>")
            			.append($Dom)
            			.appendTo($Panel);
            		$Dom.show();
            		
            		//afterLoad
            		typeof(param.afterLoad)=="function" && param.afterLoad.apply(this);
            		
            		render();
            		
            		cache[param.id || param.url] = $Panel;
            	}).fail(function(){
            		console.log("侧边栏加载dom失败，请确认id或url属性是否设置正确");
            	})
            }
            
            return {
                close:closeSlidebar
            };
        };
    })();
	*/
    
    util.loading = function(config){
    	return Loading(config);
    }
    
    return util;
});
define('util-build',["PDUtilDir/util"],function (Util) {
    return Util;
});
