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
define(["jquery"/*, "css!PDUtilDir/css/slidebar"*/], function(){
	
	var cache = {}; //缓存对象
	var sidCache = {}; //sid缓存对象
	var urlCache = {};//url对应模板缓存对象
	
	function init(config) {
		config =  $.extend({
			"sid": "",			//slidebar组件唯一id，用来缓存的key和组件dom的id
			"id": "",            //页面模板id
            "body": "",			//模板内容
            "url": "",           //远程模板url
            "urlCache": true,  	//是否缓存远程模板[默认缓存,url设置时有效]
            "cache": false,		//是否缓存组件[默认不缓存]
            "size": "",			//侧边栏宽度[支持使用：lg sm full]   full表示全屏
            "width": "",			//侧边栏宽度
            "close": true,		//点击遮蔽层时是否关闭侧边栏
    		"afterLoad": null,	//模板加载完成回调
    		"afterOpen": null,	//侧边栏打开完成回调
    		"afterClose": null,	//侧边栏关闭完成回调
    		"onDestroy": null	//侧边栏销毁时回调
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
				if (options.size == 'lg' || options.size == 'sm'){
					$slidebar.addClass(options.size);
				}else if(options.size == 'full'){
					$slidebar.css({
						'width': 'auto',
						'left': '0'
					});
				}	
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
				if (options.size == 'lg' || options.size == 'sm'){
					$slidebar.addClass(options.size);
				}else if(options.size == 'full'){
					$slidebar.css({
						'width': 'auto',
						'left': '0'
					});
				}	
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
			if (options.size == 'lg' || options.size == 'sm'){
				$slidebar.addClass(options.size);
			}else if(options.size == 'full'){
				$slidebar.css({
					'width': 'auto',
					'left': '0'
				});
			}
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